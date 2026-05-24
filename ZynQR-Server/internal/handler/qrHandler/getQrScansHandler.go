package qrhandler

import (
	qrservice "ZynQR-Server/internal/service/qrService"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetQrScansHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	qrID := c.Param("id")
	if qrID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "qr id required"})
		return
	}

	limit := 50
	if q := c.Query("limit"); q != "" {
		if n, err := strconv.Atoi(q); err == nil {
			limit = n
		}
	}

	scans, err := qrservice.ListQrScansForUserService(userID, qrID, limit)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "qr not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "scans fetched",
		"items":   scans,
	})
}
