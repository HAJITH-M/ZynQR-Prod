package qrservice

import (
	"ZynQR-Server/internal/repository"
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"

	"gorm.io/gorm"
)

func RedirectForQrID(ctx context.Context, id, clientIP, userAgent string) (dest string, httpStatus int) {
	qr, err := repository.GetQrByIDRepo(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", http.StatusNotFound
		}
		log.Printf("redirect /qr/%s: load qr: %v", id, err)
		return "", http.StatusInternalServerError
	}
	if !strings.EqualFold(strings.TrimSpace(qr.Status), "active") {
		return "", http.StatusGone
	}
	city, country := LookupApproxPlaceFromIP(ctx, clientIP)
	uaPreview := userAgent
	if len(uaPreview) > 120 {
		uaPreview = uaPreview[:120] + "…"
	}
	fmt.Printf("[QR redirect] qr_id=%s user_id=%s name=%q ip=%s city=%q country=%q ua=%q dest_len=%d analytics=%v\n",
		id, qr.UserID, qr.QrName, clientIP, city, country, uaPreview, len(strings.TrimSpace(qr.DestinationURL)), qr.AnalyticsEnabled)

	if !qr.AnalyticsEnabled {
		return qr.DestinationURL, http.StatusFound
	}

	if err := repository.IncrementQrScanCountAndRecordScanRepo(id, qr.UserID, clientIP, userAgent, city, country); err != nil {
		log.Printf("redirect /qr/%s: record scan row failed, falling back to scan_count only: %v", id, err)
		if err2 := repository.IncrementQrScanCountRepo(id); err2 != nil {
			log.Printf("redirect /qr/%s: scan_count increment failed: %v", id, err2)
			return "", http.StatusInternalServerError
		}
	}
	LogQrScan(qr.UserID, id, qr.QrName, clientIP, userAgent, city, country)
	return qr.DestinationURL, http.StatusFound
}
