package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port             string
	DBUrl            string
	JWTSecret        string
	TelegramBotToken string
	FrontendURL      string
}

func LoadConfig() *Config {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("No .env file found; falling back to environment variables")
	}

	return &Config{
		Port:             getEnv("PORT", "8080"),
		DBUrl:            getEnv("DB_URL", ""),
		JWTSecret:        getEnv("JWT_SECRET", "supersecretkey"),
		TelegramBotToken: getEnv("TELEGRAM_BOT_TOKEN", ""),
		FrontendURL:      getEnv("FRONTEND_URL", "http://localhost:5173"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
