package qrhandler

import (
	qrservice "ZynQR-Server/internal/service/qrService"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetQrAnalyticsGrowthHandler returns scan volume buckets for the growth bar chart.
// Query: period=daily|weekly|monthly (default daily). Data from qr_activity_logs scan events.
func GetQrAnalyticsGrowthHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	period := c.DefaultQuery("period", "daily")
	if period != "daily" && period != "weekly" && period != "monthly" {
		period = "daily"
	}

	buckets, err := qrservice.GetGrowthChartService(userID, period)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "growth chart",
		"period":  period,
		"buckets": buckets,
	})
}
