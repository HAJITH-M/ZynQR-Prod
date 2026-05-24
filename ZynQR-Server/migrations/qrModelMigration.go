package migrations

import (
	qrmodel "ZynQR-Server/internal/model/QrModel"
	"ZynQR-Server/pkg/database"
)

func QrMigration() error {
	return database.DB.AutoMigrate(
		&qrmodel.QrDetails{},
		&qrmodel.QrActivityLog{},
		&qrmodel.QrScan{},
	)
}
