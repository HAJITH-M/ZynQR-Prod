package qrservice

import (
	"log"
	"strings"
	"time"

	qrmodel "ZynQR-Server/internal/model/QrModel"
	"ZynQR-Server/internal/repository"
)

func shortQrID(id string) string {
	if len(id) <= 8 {
		return id
	}
	return id[:8]
}

func appendQrActivityLog(row *qrmodel.QrActivityLog) {
	if row.CreatedAt.IsZero() {
		row.CreatedAt = time.Now()
	}
	if err := repository.InsertQrActivityLogRepo(row); err != nil {
		log.Printf("qr activity log insert: %v", err)
	}
}

// LogQrCreated records a successful POST /qr/create.
func LogQrCreated(userID, qrID, qrName string) {
	appendQrActivityLog(&qrmodel.QrActivityLog{
		UserID:    userID,
		QrID:      qrID,
		EventType: qrmodel.QrActivityCreated,
		Title:     "New QR created",
		Detail:    strings.TrimSpace(qrName) + " • ID: " + shortQrID(qrID),
	})
}

// LogQrScan records a successful public /qr/:id redirect (after scan_count increment).
func LogQrScan(userID, qrID, qrName, clientIP, userAgent, city, country string) {
	detail := strings.TrimSpace(qrName) + " • ID: " + shortQrID(qrID)
	appendQrActivityLog(&qrmodel.QrActivityLog{
		UserID:    userID,
		QrID:      qrID,
		EventType: qrmodel.QrActivityScan,
		Title:     "New scan",
		Detail:    detail,
		ClientIP:  clientIP,
		UserAgent: userAgent,
		City:      city,
		Country:   country,
	})
}

// LogQrUpdated records PUT /qr/update/:id (best-effort description).
func LogQrUpdated(userID, qrID, qrName string, nameChanged, destChanged, statusChanged, analyticsChanged bool) {
	var parts []string
	if nameChanged {
		parts = append(parts, "name updated")
	}
	if destChanged {
		parts = append(parts, "destination updated")
	}
	if statusChanged {
		parts = append(parts, "status updated")
	}
	if analyticsChanged {
		parts = append(parts, "analytics updated")
	}
	detail := strings.TrimSpace(qrName) + " • ID: " + shortQrID(qrID)
	if len(parts) > 0 {
		detail += " — " + strings.Join(parts, ", ")
	}
	appendQrActivityLog(&qrmodel.QrActivityLog{
		UserID:    userID,
		QrID:      qrID,
		EventType: qrmodel.QrActivityUpdated,
		Title:     "QR updated",
		Detail:    detail,
	})
}

// LogQrDeleted records DELETE /qr/delete after removal.
func LogQrDeleted(userID, qrID, qrName string) {
	appendQrActivityLog(&qrmodel.QrActivityLog{
		UserID:    userID,
		QrID:      qrID,
		EventType: qrmodel.QrActivityDeleted,
		Title:     "QR deleted",
		Detail:    strings.TrimSpace(qrName) + " • ID: " + shortQrID(qrID),
	})
}

// ListQrActivityService returns recent activity for the dashboard.
// eventType filters rows when non-empty (must match stored event_type values).
func ListQrActivityService(userID string, limit int, eventType string) ([]*qrmodel.QrActivityLog, error) {
	return repository.ListRecentQrActivityLogsRepo(userID, limit, eventType)
}
