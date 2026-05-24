package repository

import (
	"ZynQR-Server/internal/model/staticqr"
	"ZynQR-Server/pkg/database"

	"gorm.io/gorm"
)

func CreateStaticQrRepo(row *staticqr.StaticQr) error {
	return database.DB.Create(row).Error
}

func ListStaticQrByUserRepo(userID string) ([]staticqr.StaticQr, error) {
	var rows []staticqr.StaticQr
	err := database.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&rows).Error
	return rows, err
}

func DeleteStaticQrForUserRepo(id, userID string) error {
	res := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&staticqr.StaticQr{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
