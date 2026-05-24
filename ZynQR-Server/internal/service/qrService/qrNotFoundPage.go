package qrservice

import (
	"ZynQR-Server/internal/config/env"
	"strings"
)

// QrNotFoundPageURL is the frontend page when a dynamic QR was deleted (QR_NOT_FOUND_PAGE_URL in .env).
func QrNotFoundPageURL() string {
	return strings.TrimSuffix(strings.TrimSpace(env.AppEnv.QR_NOT_FOUND_PAGE_URL), "/")
}
