package qrmodel

import "time"

// QrScan is one physical scan of a public /qr/:id link.
// ScanDate and ScanTime are stored as separate columns (UTC calendar date and wall time).
// QrDetails.ScanCount stays in sync (incremented in the same transaction as each insert).
type QrScan struct {
	ID string `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null" json:"id"`

	UserID string `gorm:"type:uuid;not null;index" json:"user_id"`
	QrID   string `gorm:"type:uuid;not null;index" json:"qr_id"`

	// ScanDate / ScanTime are separate UTC columns (varchar avoids PG DATE/TIME driver quirks).
	ScanDate string `gorm:"type:varchar(10);not null;index" json:"scan_date"` // YYYY-MM-DD
	ScanTime string `gorm:"type:varchar(12);not null" json:"scan_time"`       // HH:MM:SS[.fff]

	ClientIP string `gorm:"type:varchar(64)" json:"client_ip,omitempty"`

	// Scanner metadata (public /qr/:id redirect — not GPS; city/country from IP geolocation when available).
	UserAgent string `gorm:"type:varchar(512)" json:"user_agent,omitempty"`
	City      string `gorm:"type:varchar(128)" json:"city,omitempty"`
	Country   string `gorm:"type:varchar(128)" json:"country,omitempty"`

	// ScannedAt is the full instant (same moment as scan_date + scan_time in UTC).
	CreatedAt time.Time `json:"scanned_at"`
}
