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

// RedirectForQrID is kept for backwards compatibility (any caller that already
// has just a string IP). It builds a minimal ClientMeta and delegates.
func RedirectForQrID(ctx context.Context, id, clientIP, userAgent string) (dest string, httpStatus int) {
	return RedirectForQrIDWithMeta(ctx, id, ClientMeta{IP: clientIP}, userAgent)
}

// RedirectForQrIDWithMeta is the canonical entry point. It expects a fully
// resolved ClientMeta (see ExtractClientMeta). When the platform already
// provided city/country (e.g. x-vercel-ip-*), we use those directly and skip
// the external geocoder — this is faster, free, and immune to ipapi.co's
// rate-limiting.
func RedirectForQrIDWithMeta(ctx context.Context, id string, meta ClientMeta, userAgent string) (dest string, httpStatus int) {
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

	city, country := meta.City, meta.Country
	if city == "" && country == "" {
		city, country = LookupApproxPlaceFromIP(ctx, meta.IP)
	} else {
		fmt.Printf("[QR redirect] using platform geo for ip=%s city=%q country=%q (skipped external lookup)\n",
			meta.IP, city, country)
	}

	uaPreview := userAgent
	if len(uaPreview) > 120 {
		uaPreview = uaPreview[:120] + "…"
	}
	fmt.Printf("[QR redirect] qr_id=%s user_id=%s name=%q ip=%s city=%q country=%q ua=%q dest_len=%d analytics=%v\n",
		id, qr.UserID, qr.QrName, meta.IP, city, country, uaPreview, len(strings.TrimSpace(qr.DestinationURL)), qr.AnalyticsEnabled)

	if !qr.AnalyticsEnabled {
		return qr.DestinationURL, http.StatusFound
	}

	if err := repository.IncrementQrScanCountAndRecordScanRepo(id, qr.UserID, meta.IP, userAgent, city, country); err != nil {
		log.Printf("redirect /qr/%s: record scan row failed, falling back to scan_count only: %v", id, err)
		if err2 := repository.IncrementQrScanCountRepo(id); err2 != nil {
			log.Printf("redirect /qr/%s: scan_count increment failed: %v", id, err2)
			return "", http.StatusInternalServerError
		}
	}
	LogQrScan(qr.UserID, id, qr.QrName, meta.IP, userAgent, city, country)
	return qr.DestinationURL, http.StatusFound
}
