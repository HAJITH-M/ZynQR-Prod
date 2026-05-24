package repository

import (
	qrmodel "ZynQR-Server/internal/model/QrModel"
	"ZynQR-Server/pkg/database"
)

// QrAnalyticsSummaryAgg is one-row aggregate for global analytics summary cards.
type QrAnalyticsSummaryAgg struct {
	TotalQrCount        int64 `gorm:"column:total_qr_count"`
	ActiveQrCount       int64 `gorm:"column:active_qr_count"`
	TotalAggregateScans int64 `gorm:"column:total_aggregate_scans"`
	QrsWithScans        int64 `gorm:"column:qrs_with_scans"`
}

func QrAnalyticsSummaryRepo(userID string) (*QrAnalyticsSummaryAgg, error) {
	var row QrAnalyticsSummaryAgg
	err := database.DB.Model(&qrmodel.QrDetails{}).
		Where("user_id = ?", userID).
		Select(
			"COUNT(*) AS total_qr_count",
			"COALESCE(SUM(scan_count), 0) AS total_aggregate_scans",
			"SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_qr_count",
			"SUM(CASE WHEN scan_count > 0 THEN 1 ELSE 0 END) AS qrs_with_scans",
		).
		Scan(&row).Error
	if err != nil {
		return nil, err
	}
	return &row, nil
}
