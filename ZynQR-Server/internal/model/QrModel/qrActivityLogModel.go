package qrmodel

import "time"

// Qr activity event types (stored in qr_activity_logs.event_type).
const (
	QrActivityScan    = "scan"
	QrActivityCreated = "qr_created"
	QrActivityUpdated = "qr_updated"
	QrActivityDeleted = "qr_deleted"
)

// QrActivityLog is an append-only audit row for dashboard “Recent activity”.
type QrActivityLog struct {
	ID string `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null" json:"id"`

	UserID string `gorm:"type:uuid;not null;index:idx_qr_activity_user_time,priority:1" json:"-"`
	QrID   string `gorm:"type:uuid;index" json:"qr_id"`

	EventType string `gorm:"type:varchar(32);not null" json:"event_type"`
	Title     string `gorm:"type:varchar(200);not null" json:"title"`
	Detail    string `gorm:"type:varchar(500)" json:"detail"`
	ClientIP  string `gorm:"type:varchar(64)" json:"client_ip,omitempty"`
	UserAgent string `gorm:"type:varchar(512)" json:"user_agent,omitempty"`
	City      string `gorm:"type:varchar(128)" json:"city,omitempty"`
	Country   string `gorm:"type:varchar(128)" json:"country,omitempty"`

	CreatedAt time.Time `gorm:"index:idx_qr_activity_user_time,priority:2" json:"created_at"`
}
