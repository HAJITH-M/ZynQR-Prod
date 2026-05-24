package qrhandler

import (
	qrservice "ZynQR-Server/internal/service/qrService"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetAllQrHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	qrs, err := qrservice.GetAllQrService(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "QR codes fetched successfully",
		"qrs":     qrs,
	})
}
