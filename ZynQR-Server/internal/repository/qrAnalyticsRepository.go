package repository

import (
	qrmodel "ZynQR-Server/internal/model/QrModel"
	"ZynQR-Server/pkg/database"
	"time"
)

// GrowthAggRow is one grouped bucket from the DB (PostgreSQL).
type GrowthAggRow struct {
	Bucket time.Time `gorm:"column:bucket"`
	Count  int64     `gorm:"column:cnt"`
}

// ScanGrowthByTruncRepo aggregates scan logs using date_trunc (PostgreSQL).
// truncUnit must be one of: day, week, month.
func ScanGrowthByTruncRepo(userID, truncUnit string, since, until time.Time) ([]GrowthAggRow, error) {
	var rows []GrowthAggRow
	// date_trunc in UTC for consistent buckets
	err := database.DB.Raw(`
		SELECT date_trunc(?, created_at AT TIME ZONE 'UTC') AS bucket, COUNT(*)::bigint AS cnt
		FROM qr_activity_logs
		WHERE user_id = ?
		  AND event_type = ?
		  AND created_at >= ?
		  AND created_at < ?
		GROUP BY 1
		ORDER BY 1
	`, truncUnit, userID, qrmodel.QrActivityScan, since, until).Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	return rows, nil
}
