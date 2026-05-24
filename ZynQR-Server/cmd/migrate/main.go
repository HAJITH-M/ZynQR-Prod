package main

import (
	"log"

	"ZynQR-Server/migrations"
	"ZynQR-Server/pkg/database"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}

	log.Println("Migration completed successfully")
}

func run() error {
	if err := database.Connect(); err != nil {
		return err
	}
	defer database.Close()

	if err := migrations.Migrate(); err != nil {
		return err
	}

	return nil
}
