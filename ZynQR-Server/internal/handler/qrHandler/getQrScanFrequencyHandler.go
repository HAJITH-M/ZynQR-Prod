package qrhandler

import (
	qrservice "ZynQR-Server/internal/service/qrService"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetQrScanFrequencyHandler returns daily scan counts for one QR.
// Path :id = qr uuid. Query: window=7d|30d|90d (default 30d).
func GetQrScanFrequencyHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	qrID := c.Param("id")
	if qrID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "qr id required"})
		return
	}

	window := c.DefaultQuery("window", "30d")
	switch window {
	case "7d", "30d", "90d":
	default:
		window = "30d"
	}

	buckets, err := qrservice.GetQrScanFrequencyService(userID, qrID, window)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "qr not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "scan frequency",
		"window":  window,
		"buckets": buckets,
	})
}
