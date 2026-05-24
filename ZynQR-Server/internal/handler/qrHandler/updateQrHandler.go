package qrhandler

import (
	qrservice "ZynQR-Server/internal/service/qrService"
	"ZynQR-Server/pkg/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type updateQrRequest struct {
	QrName           string `json:"qr_name" binding:"omitempty"`
	DestinationURL   string `json:"destination_url" binding:"omitempty"`
	Status           string `json:"status" binding:"omitempty"`
	AnalyticsEnabled *bool  `json:"analytics_enabled"`
}

func UpdateQrHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")
	var req updateQrRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationErrors(err)})
		return
	}
	err := qrservice.UpdateQrService(userID, id, req.QrName, req.DestinationURL, req.Status, req.AnalyticsEnabled)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "QR code updated successfully"})
}
