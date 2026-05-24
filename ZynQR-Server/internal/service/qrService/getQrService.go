package qrservice

import (
	qrmodel "ZynQR-Server/internal/model/QrModel"
	"ZynQR-Server/internal/repository"
)

func GetAllQrService(userID string) ([]*qrmodel.QrDetails, error) {

	qrs, err := repository.GetAllQrRepo(userID)
	if err != nil {
		return nil, err
	}
	return qrs, nil
}
