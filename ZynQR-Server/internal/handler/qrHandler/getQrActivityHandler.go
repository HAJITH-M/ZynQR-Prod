package qrhandler

import (
	qrmodel "ZynQR-Server/internal/model/QrModel"
	qrservice "ZynQR-Server/internal/service/qrService"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func normalizeActivityEventTypeFilter(raw string) string {
	s := strings.TrimSpace(strings.ToLower(raw))
	if s == "" {
		return ""
	}
	switch s {
	case qrmodel.QrActivityScan, qrmodel.QrActivityCreated, qrmodel.QrActivityUpdated, qrmodel.QrActivityDeleted:
		return s
	default:
		return ""
	}
}

func GetQrActivityHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	limit := 20
	if q := c.Query("limit"); q != "" {
		if n, err := strconv.Atoi(q); err == nil {
			limit = n
		}
	}
	if limit < 1 {
		limit = 1
	}
	if limit > 100 {
		limit = 100
	}

	eventType := normalizeActivityEventTypeFilter(c.Query("event_type"))
	logs, err := qrservice.ListQrActivityService(userID, limit, eventType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "activity fetched",
		"items":   logs,
	})
}
