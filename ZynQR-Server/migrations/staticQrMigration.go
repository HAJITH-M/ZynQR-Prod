package migrations

import (
	"ZynQR-Server/internal/model/staticqr"
	"ZynQR-Server/pkg/database"
)

func StaticQrMigration() error {
	return database.DB.AutoMigrate(&staticqr.StaticQr{})
}
