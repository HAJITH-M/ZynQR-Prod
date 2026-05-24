package env

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type EnvironmentVars struct {
	// General config variables
	APP_ENV               string
	APP_NAME              string // brand name in emails (e.g. ZynQR)
	GIN_MODE              string
	PUBLIC_SCAN_URL       string // origin for /qr/<id> scan links
	INACTIVE_QR_PAGE_URL  string // full URL for inactive dynamic QR redirect
	QR_NOT_FOUND_PAGE_URL string // full URL when owner deleted the QR
	IP_GEO_API_BASE_URL   string // e.g. https://ipapi.co — appends /{ip}/json/

	// Google OAuth config variables
	CLIENT_ID     string
	CLIENT_SECRET string
	REDIRECT_URL  string
	FRONTEND_URL  string // origin of the React app — Google callback redirects here after success/failure

	// DB config variables
	DB_HOST     string
	DB_PORT     string
	DB_USER     string
	DB_PASSWORD string
	DB_NAME     string
	DB_SSLMODE  string

	// JWT secret
	JWT_SECRECT        string
	JWT_REFRESH_SECRET string

	// Mail Config
	SMTP_FROM           string
	SMTP_PASSWORD       string
	SMTP_HOST           string
	SMTP_PORT           string
	SMTP_URL            string
	CONTACT_INBOX_EMAIL string // inbox for /contact form submissions (defaults to SMTP_FROM)

	// Redis Config
	REDIS_ADDR     string
	REDIS_USERNAME string
	REDIS_PASSWORD string
	REDIS_DB       int
}

var AppEnv EnvironmentVars

func Load() {
	// In local dev, load from .env file — in production (Vercel),
	// env vars are injected directly so godotenv.Load() is safely skipped
	if os.Getenv("APP_ENV") == "" {
		_ = godotenv.Load(".env")
		_ = godotenv.Load("../../.env") // fallback for running from subdirectory
	}

	redisDB, err := strconv.Atoi(os.Getenv("REDIS_DB"))
	if err != nil {
		redisDB = 0 // safe default
	}

	AppEnv = EnvironmentVars{
		// General
		APP_ENV:               os.Getenv("APP_ENV"),
		APP_NAME:              os.Getenv("APP_NAME"),
		GIN_MODE:              os.Getenv("GIN_MODE"),
		PUBLIC_SCAN_URL:       os.Getenv("PUBLIC_SCAN_URL"),
		INACTIVE_QR_PAGE_URL:  os.Getenv("INACTIVE_QR_PAGE_URL"),
		QR_NOT_FOUND_PAGE_URL: os.Getenv("QR_NOT_FOUND_PAGE_URL"),
		IP_GEO_API_BASE_URL:   os.Getenv("IP_GEO_API_BASE_URL"),

		// Google OAuth
		CLIENT_ID:     os.Getenv("CLIENT_ID"),
		CLIENT_SECRET: os.Getenv("CLIENT_SECRET"),
		REDIRECT_URL:  os.Getenv("REDIRECT_URL"),
		FRONTEND_URL:  os.Getenv("FRONTEND_URL"),

		// DB
		DB_HOST:     os.Getenv("DB_HOST"),
		DB_PORT:     os.Getenv("DB_PORT"),
		DB_USER:     os.Getenv("DB_USER"),
		DB_PASSWORD: os.Getenv("DB_PASSWORD"),
		DB_NAME:     os.Getenv("DB_NAME"),
		DB_SSLMODE:  os.Getenv("DB_SSLMODE"),

		// JWT
		JWT_SECRECT:        os.Getenv("JWT_SECRET"),
		JWT_REFRESH_SECRET: os.Getenv("JWT_REFRESH_SECRET"),

		// Mail
		SMTP_FROM:           os.Getenv("SMTP_FROM"),
		SMTP_PASSWORD:       os.Getenv("SMTP_PASSWORD"),
		SMTP_HOST:           os.Getenv("SMTP_HOST"),
		SMTP_PORT:           os.Getenv("SMTP_PORT"),
		SMTP_URL:            os.Getenv("SMTP_URL"),
		CONTACT_INBOX_EMAIL: firstEnv("CONTACT_INBOX_EMAIL", "CONTACT_INBOX_EMAIL_EMAIL"),

		// Redis
		REDIS_ADDR:     os.Getenv("REDIS_ADDR"),
		REDIS_USERNAME: os.Getenv("REDIS_USERNAME"),
		REDIS_PASSWORD: os.Getenv("REDIS_PASSWORD"),
		REDIS_DB:       redisDB,
	}

	if AppEnv.DB_HOST == "" {
		log.Fatal("❌ Environment variables not loaded — DB_HOST is missing")
	}
}

func firstEnv(keys ...string) string {
	for _, k := range keys {
		if v := strings.TrimSpace(os.Getenv(k)); v != "" {
			return v
		}
	}
	return ""
}
