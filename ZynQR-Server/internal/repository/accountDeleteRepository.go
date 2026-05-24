package repository

import (
	authmodel "ZynQR-Server/internal/model/AuthModel"
	qrmodel "ZynQR-Server/internal/model/QrModel"
	"ZynQR-Server/internal/model/staticqr"
	"ZynQR-Server/pkg/database"

	"gorm.io/gorm"
)

// DeleteUserAccountAndAllDataRepo removes the user and all related rows (QRs, scans, sessions, etc.) in one transaction.
func DeleteUserAccountAndAllDataRepo(userID string) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("user_id = ?", userID).Delete(&qrmodel.QrScan{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", userID).Delete(&qrmodel.QrActivityLog{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", userID).Delete(&qrmodel.QrDetails{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", userID).Delete(&staticqr.StaticQr{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", userID).Delete(&authmodel.SecurityAuditLog{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", userID).Delete(&authmodel.Session{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", userID).Delete(&authmodel.UserToken{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", userID).Delete(&authmodel.AuthenticationMethod{}).Error; err != nil {
			return err
		}
		if err := tx.Where("id = ?", userID).Delete(&authmodel.User{}).Error; err != nil {
			return err
		}
		return nil
	})
}
