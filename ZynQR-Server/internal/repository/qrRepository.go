package repository

import (
	"time"

	qrmodel "ZynQR-Server/internal/model/QrModel"
	"ZynQR-Server/pkg/database"

	"gorm.io/gorm"
)

func CreateQrRepository(qr *qrmodel.QrDetails) error {
	// GORM omits zero values on Create; analytics_enabled=false must be written explicitly
	// or the column falls back to DB default true.
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		return tx.Select(
			"ID", "UserID", "QrName", "DestinationURL", "Status",
			"AnalyticsEnabled", "QrImageURL", "CreatedAt", "UpdatedAt",
		).Create(qr).Error
	})

	return err
}

func GetQrByIDRepo(id string) (*qrmodel.QrDetails, error) {
	var qr qrmodel.QrDetails
	res := database.DB.Where("id = ?", id).Limit(1).Find(&qr)
	if res.Error != nil {
		return nil, res.Error
	}
	if res.RowsAffected == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	return &qr, nil
}

// GetQrByUserAndIDRepo loads a QR owned by userID (for updates / deletes / logging).
func GetQrByUserAndIDRepo(userID, id string) (*qrmodel.QrDetails, error) {
	var qr qrmodel.QrDetails
	if err := database.DB.Where("user_id = ? AND id = ?", userID, id).First(&qr).Error; err != nil {
		return nil, err
	}
	return &qr, nil
}

// IncrementQrScanCountRepo atomically adds one to scan_count for the given QR id.
func IncrementQrScanCountRepo(id string) error {
	return database.DB.Model(&qrmodel.QrDetails{}).
		Where("id = ?", id).
		UpdateColumn("scan_count", gorm.Expr("scan_count + ?", 1)).Error
}

// IncrementQrScanCountAndRecordScanRepo bumps scan_count and inserts one qr_scans row (UTC date + time) in a single transaction.
func IncrementQrScanCountAndRecordScanRepo(qrID, userID, clientIP, userAgent, city, country string) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&qrmodel.QrDetails{}).
			Where("id = ?", qrID).
			UpdateColumn("scan_count", gorm.Expr("scan_count + ?", 1)).Error; err != nil {
			return err
		}
		now := time.Now().UTC()
		row := &qrmodel.QrScan{
			UserID:    userID,
			QrID:      qrID,
			ScanDate:  now.Format("2006-01-02"),
			ScanTime:  now.Format("15:04:05"),
			ClientIP:  clientIP,
			UserAgent: userAgent,
			City:      city,
			Country:   country,
			CreatedAt: now,
		}
		return tx.Create(row).Error
	})
}

func GetAllQrRepo(userID string) ([]*qrmodel.QrDetails, error) {
	var qrs []*qrmodel.QrDetails
	if err := database.DB.Where("user_id = ?", userID).Find(&qrs).Error; err != nil {
		return nil, err
	}
	return qrs, nil
}

func UpdateQrRepo(qr *qrmodel.QrDetails) error {
	err := database.DB.Model(&qrmodel.QrDetails{}).
		Where("user_id = ? AND id = ?", qr.UserID, qr.ID).
		Select("QrName", "DestinationURL", "Status", "AnalyticsEnabled").
		Updates(qr).Error
	if err != nil {
		return err
	}
	return nil
}

// QrScanDailyCountsRepo aggregates scans per UTC calendar day for one QR (owner user_id + qr_id).
func QrScanDailyCountsRepo(userID, qrID string, since, until time.Time) ([]GrowthAggRow, error) {
	var rows []GrowthAggRow
	err := database.DB.Raw(`
		SELECT date_trunc('day', created_at AT TIME ZONE 'UTC') AS bucket, COUNT(*)::bigint AS cnt
		FROM qr_scans
		WHERE user_id = ? AND qr_id = ?
		  AND created_at >= ? AND created_at < ?
		GROUP BY 1
		ORDER BY 1
	`, userID, qrID, since, until).Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	return rows, nil
}

// ListQrScansForOwnerRepo returns newest-first scan rows for a QR owned by userID.
func ListQrScansForOwnerRepo(userID, qrID string, limit int) ([]*qrmodel.QrScan, error) {
	if limit < 1 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}
	var rows []*qrmodel.QrScan
	err := database.DB.
		Where("user_id = ? AND qr_id = ?", userID, qrID).
		Order("created_at DESC").
		Limit(limit).
		Find(&rows).Error
	if err != nil {
		return nil, err
	}
	return rows, nil
}

func DeleteQrRepo(userID, id string) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("qr_id = ?", id).Delete(&qrmodel.QrScan{}).Error; err != nil {
			return err
		}
		return tx.Where("user_id = ? AND id = ?", userID, id).Delete(&qrmodel.QrDetails{}).Error
	})
}
