package qrhandler

import (
	qrservice "ZynQR-Server/internal/service/qrService"
	"ZynQR-Server/pkg/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type createQrRequest struct {
	Email          string `json:"email" binding:"required,email"`
	DestinationURL string `json:"destination_url" binding:"required"`
	QrName         string `json:"qr_name" binding:"required"`
	// When omitted or null, defaults to true (record scans).
	AnalyticsEnabled *bool `json:"analytics_enabled"`
}

func CreateQrHandler(c *gin.Context) {
	var req createQrRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationErrors(err)})
		return
	}

	analytics := true
	if req.AnalyticsEnabled != nil {
		analytics = *req.AnalyticsEnabled
	}

	result, err := qrservice.CreateQrService(req.Email, req.DestinationURL, req.QrName, analytics)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":           "QR code created successfully",
		"qr_id":             result.ID,
		"qr_name":           result.QrName,
		"scan_url":          result.ScanURL,
		"destination_url":   result.DestinationURL,
		"status":            result.Status,
		"scan_count":        result.ScanCount,
		"analytics_enabled": analytics,
	})
}
