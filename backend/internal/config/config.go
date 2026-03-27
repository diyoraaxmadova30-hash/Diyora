package config

import (
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

type Config struct {
	Port             string
	DBUrl            string
	JWTSecret        string
	TelegramBotToken string
	FrontendURL      string
	BackendURL       string
}

func LoadConfig() *Config {
	envPaths := []string{
		".env",
		"../.env",
		"../../.env",
	}

	loaded := false
	for _, path := range envPaths {
		if err := godotenv.Load(path); err == nil {
			loaded = true
			break
		}
	}

	if !loaded {
		if cwd, err := os.Getwd(); err == nil {
			log.Printf("No .env file found from %s; falling back to environment variables", filepath.Clean(cwd))
		} else {
			log.Println("No .env file found; falling back to environment variables")
		}
	}

	return &Config{
		Port:             getEnv("PORT", "8080"),
		DBUrl:            getEnv("DB_URL", ""),
		JWTSecret:        getEnv("JWT_SECRET", "supersecretkey"),
		TelegramBotToken: getEnv("TELEGRAM_BOT_TOKEN", ""),
		FrontendURL:      getEnv("FRONTEND_URL", "http://localhost:5173"),
		BackendURL:       getEnv("BACKEND_URL", "http://localhost:8080"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
