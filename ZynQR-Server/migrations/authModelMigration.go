package migrations

import (
	authmodel "ZynQR-Server/internal/model/AuthModel"
	"ZynQR-Server/pkg/database"
)

func AuthMigration() error {
	return database.DB.AutoMigrate(
		&authmodel.User{},
		&authmodel.AuthenticationMethod{},
		&authmodel.Session{},
		&authmodel.UserToken{},
		&authmodel.SecurityAuditLog{},
	)
}
