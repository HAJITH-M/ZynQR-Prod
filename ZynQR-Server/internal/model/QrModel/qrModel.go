package qrmodel

import (
	"time"
)

type QrDetails struct {
	ID string `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null"`

	UserID string `gorm:"type:uuid;not null;index"`
	// User   authmodel.User `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE"`

	QrName string `gorm:"type:varchar(250)"`

	DestinationURL string `gorm:"type:text;not null"`
	// Code           string `gorm:"type:varchar(50);uniqueIndex;not null"`
	Status string `gorm:"type:varchar(10);not null"`

	// ScanCount increments on each successful /qr/:id redirect (denormalized; each bump also inserts qr_scans).
	ScanCount int64 `gorm:"type:bigint;not null;default:0" json:"scan_count"`

	// AnalyticsEnabled when false: redirect still works but scan_count, qr_scans, and activity logs are not updated.
	AnalyticsEnabled bool `gorm:"not null;default:true" json:"analytics_enabled"`

	QrImageURL string `gorm:"type:text;not null"`

	CreatedAt time.Time
	UpdatedAt time.Time
}
