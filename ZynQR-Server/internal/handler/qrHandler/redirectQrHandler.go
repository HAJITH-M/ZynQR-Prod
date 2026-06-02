package qrhandler

import (
	qrservice "ZynQR-Server/internal/service/qrService"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RedirectQrHandler(c *gin.Context) {
	// Resolve client IP + (optional platform-provided) geo by inspecting
	// request headers directly. We deliberately do NOT use c.ClientIP() here:
	// Gin's TrustedPlatform shortcut returns the raw header value which on
	// Vercel can be the full "client, internal" chain, and TrustedProxies
	// requires knowing the proxy CIDR (impossible on serverless).
	meta := qrservice.ExtractClientMeta(c.Request)

	dest, status := qrservice.RedirectForQrIDWithMeta(
		c.Request.Context(),
		c.Param("id"),
		meta,
		c.Request.UserAgent(),
	)
	if status == http.StatusFound {
		c.Redirect(http.StatusFound, dest)
		return
	}
	if status == http.StatusNotFound {
		c.Redirect(http.StatusFound, qrservice.QrNotFoundPageURL())
		return
	}
	if status == http.StatusGone {
		c.Redirect(http.StatusFound, qrservice.InactiveQrPageURL())
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to resolve qr"})
}
