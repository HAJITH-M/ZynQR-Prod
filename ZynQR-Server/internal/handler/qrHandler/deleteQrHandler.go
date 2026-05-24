package qrhandler

import (
	qrservice "ZynQR-Server/internal/service/qrService"
	"ZynQR-Server/pkg/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type deleteQrRequest struct {
	QrID string `json:"qr_id" binding:"required"`
}

func DeleteQrHandler(c *gin.Context) {
	var req deleteQrRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationErrors(err)})
		return
	}
	userID := c.GetString("user_id")
	err := qrservice.DeleteQrService(userID, req.QrID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "QR code deleted successfully"})
}
