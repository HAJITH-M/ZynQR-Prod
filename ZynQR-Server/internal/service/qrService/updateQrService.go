package qrservice

import (
	qrmodel "ZynQR-Server/internal/model/QrModel"
	"ZynQR-Server/internal/repository"
)

func UpdateQrService(userID, id, qrName, DestinationURL, status string, analyticsOverride *bool) error {
	prev, err := repository.GetQrByUserAndIDRepo(userID, id)
	if err != nil {
		return err
	}

	analyticsEnabled := prev.AnalyticsEnabled
	if analyticsOverride != nil {
		analyticsEnabled = *analyticsOverride
	}

	nameChanged := qrName != "" && qrName != prev.QrName
	destChanged := DestinationURL != "" && DestinationURL != prev.DestinationURL
	statusChanged := status != "" && status != prev.Status
	analyticsChanged := analyticsEnabled != prev.AnalyticsEnabled

	err = repository.UpdateQrRepo(&qrmodel.QrDetails{
		ID:               id,
		UserID:           userID,
		QrName:           qrName,
		DestinationURL:   DestinationURL,
		Status:           status,
		AnalyticsEnabled: analyticsEnabled,
	})
	if err != nil {
		return err
	}

	displayName := prev.QrName
	if qrName != "" {
		displayName = qrName
	}
	LogQrUpdated(userID, id, displayName, nameChanged, destChanged, statusChanged, analyticsChanged)
	return nil
}
