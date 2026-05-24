package qrservice

import (
	"ZynQR-Server/internal/config/env"
	"strings"
)

// InactiveQrPageURL is the frontend page shown when a dynamic QR is inactive (INACTIVE_QR_PAGE_URL in .env).
func InactiveQrPageURL() string {
	return strings.TrimSuffix(strings.TrimSpace(env.AppEnv.INACTIVE_QR_PAGE_URL), "/")
}
