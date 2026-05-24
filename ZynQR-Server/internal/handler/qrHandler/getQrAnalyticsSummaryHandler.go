package qrhandler

import (
	qrservice "ZynQR-Server/internal/service/qrService"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetQrAnalyticsSummaryHandler returns aggregate stats for global analytics summary cards.
func GetQrAnalyticsSummaryHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	summary, err := qrservice.GetAnalyticsSummaryService(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "analytics summary",
		"summary": summary,
	})
}
