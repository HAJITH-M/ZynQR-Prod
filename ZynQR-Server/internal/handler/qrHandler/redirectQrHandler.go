package qrhandler

import (
	qrservice "ZynQR-Server/internal/service/qrService"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RedirectQrHandler(c *gin.Context) {
	dest, status := qrservice.RedirectForQrID(c.Request.Context(), c.Param("id"), c.ClientIP(), c.Request.UserAgent())
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
