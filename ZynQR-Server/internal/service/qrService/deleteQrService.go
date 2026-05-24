package qrservice

import "ZynQR-Server/internal/repository"

func DeleteQrService(userID, id string) error {
	prev, err := repository.GetQrByUserAndIDRepo(userID, id)
	if err != nil {
		return err
	}
	if err := repository.DeleteQrRepo(userID, id); err != nil {
		return err
	}
	LogQrDeleted(userID, id, prev.QrName)
	return nil
}
