package qrservice

import (
	qrmodel "ZynQR-Server/internal/model/QrModel"
	"ZynQR-Server/internal/repository"
	"errors"

	"gorm.io/gorm"
)

// ListQrScansForUserService returns recent scan rows for qrID if it belongs to userID.
func ListQrScansForUserService(userID, qrID string, limit int) ([]*qrmodel.QrScan, error) {
	if _, err := repository.GetQrByUserAndIDRepo(userID, qrID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return nil, err
	}
	return repository.ListQrScansForOwnerRepo(userID, qrID, limit)
}
