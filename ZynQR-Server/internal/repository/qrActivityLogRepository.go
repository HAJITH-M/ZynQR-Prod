package repository

import (
	qrmodel "ZynQR-Server/internal/model/QrModel"
	"ZynQR-Server/pkg/database"
)

func InsertQrActivityLogRepo(row *qrmodel.QrActivityLog) error {
	return database.DB.Create(row).Error
}

// ListRecentQrActivityLogsRepo returns newest-first rows for a user.
// eventType filters by qr_activity_logs.event_type when non-empty (e.g. "scan").
func ListRecentQrActivityLogsRepo(userID string, limit int, eventType string) ([]*qrmodel.QrActivityLog, error) {
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	q := database.DB.Where("user_id = ?", userID)
	if eventType != "" {
		q = q.Where("event_type = ?", eventType)
	}
	var rows []*qrmodel.QrActivityLog
	err := q.Order("created_at DESC").Limit(limit).Find(&rows).Error
	if err != nil {
		return nil, err
	}
	return rows, nil
}
