package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/middleware"
	"backend/internal/repositories"
	"backend/internal/services"
	"backend/internal/telegram"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func main() {
	cfg := config.LoadConfig()

	db := database.ConnectDB(cfg.DBUrl)
	defer db.Close()

	// Initialize Repositories
	userRepo := repositories.NewUserRepo(db)
	catRepo := repositories.NewCategoryRepo(db)
	prodRepo := repositories.NewProductRepo(db)
	orderRepo := repositories.NewOrderRepo(db)

	// Initialize Services
	authService := services.NewAuthService(userRepo)

	// Telegram Bot
	if cfg.TelegramBotToken != "" {
		botAPI, err := tgbotapi.NewBotAPI(cfg.TelegramBotToken)
		if err != nil {
			log.Printf("Failed to initialize telegram bot: %v", err)
		} else {
			log.Printf("Authorized on account %s", botAPI.Self.UserName)
			botHandler := telegram.NewBotHandler(botAPI, userRepo, catRepo, prodRepo, repositories.NewCartRepo(db), orderRepo)
			go botHandler.StartListening()
		}
	} else {
		log.Println("WARNING: No TELEGRAM_BOT_TOKEN provided. Bot is disabled.")
	}

	// Initialize Handlers
	authHandler := handlers.NewAuthHandler(authService)
	catHandler := handlers.NewCategoryHandler(catRepo)
	prodHandler := handlers.NewProductHandler(prodRepo)
	userHandler := handlers.NewUserHandler(userRepo)
	orderHandler := handlers.NewOrderHandler(orderRepo)

	// Setup Gin Router
	r := gin.Default()

	// Middleware
	r.Use(middleware.RequestLogger())
	r.Use(middleware.JSONHandler())

	// CORS Configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.Static("/uploads", "./uploads")

	// API Routes
	api := r.Group("/api")

	api.POST("/auth/login", authHandler.Login)
	api.POST("/upload", middleware.AuthMiddleware(), middleware.AdminMiddleware(), handlers.UploadImage)

	// Categories
	catGroup := api.Group("/categories")
	{
		catGroup.GET("", catHandler.GetAll)
		catGroup.POST("", middleware.AuthMiddleware(), middleware.AdminMiddleware(), catHandler.Create)
		catGroup.PUT("/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), catHandler.Update)
		catGroup.DELETE("/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), catHandler.Delete)
	}

	// Products
	prodGroup := api.Group("/products")
	{
		prodGroup.GET("", prodHandler.GetAll)
		prodGroup.GET("/:id", prodHandler.GetByID)
		prodGroup.POST("", middleware.AuthMiddleware(), middleware.AdminMiddleware(), prodHandler.Create)
		prodGroup.PUT("/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), prodHandler.Update)
		prodGroup.DELETE("/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), prodHandler.Delete)
	}

	// Orders (Admin mostly)
	orderGroup := api.Group("/orders", middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		orderGroup.GET("", orderHandler.GetAll)
		orderGroup.GET("/:id", orderHandler.GetByID)
		orderGroup.PUT("/:id/status", orderHandler.UpdateStatus)
	}

	// Users (Admin mostly)
	userGroup := api.Group("/users", middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		userGroup.GET("", userHandler.GetAll)
		userGroup.GET("/:id", userHandler.GetByID)
	}

	// Graceful Shutdown Setup
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	go func() {
		log.Printf("Server starting on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}
