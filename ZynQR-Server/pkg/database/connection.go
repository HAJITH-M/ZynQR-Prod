package database

import (
	"ZynQR-Server/internal/config/env"
	"fmt"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() error {

	env.Load()

	cfg := env.AppEnv

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		cfg.DB_HOST,
		cfg.DB_USER,
		cfg.DB_PASSWORD,
		cfg.DB_NAME,
		cfg.DB_PORT,
		cfg.DB_SSLMODE,
	)
	// fmt.Println("DSN print:", dsn)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})

	if err != nil {
		return err
	}

	// Get underlying sql.DB
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}

	// CONNECTION POOL SETTINGS

	sqlDB.SetMaxOpenConns(10)                 // max DB connections
	sqlDB.SetMaxIdleConns(2)                  // idle connections
	sqlDB.SetConnMaxLifetime(5 * time.Minute) // recycle connections
	sqlDB.SetConnMaxIdleTime(1 * time.Minute) // idle timeout

	DB = db

	return nil
}

func Close() error {
	if DB == nil {
		return nil
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	return sqlDB.Close()
}
