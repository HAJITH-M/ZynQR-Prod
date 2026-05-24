package staticqr

import "time"

// StaticQr stores a QR whose bitmap encodes user payload directly (no redirect endpoint; no scan aggregation).
// Distinct from tracked dynamic codes in qr_details.
type StaticQr struct {
	ID string `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null"`

	UserID string `gorm:"type:uuid;not null;index"`

	Name           string `gorm:"type:varchar(250);not null"`
	EncodedPayload string `gorm:"type:text;not null"`

	ImageDataURL string `gorm:"type:text;not null"`

	CreatedAt time.Time
	UpdatedAt time.Time
}
