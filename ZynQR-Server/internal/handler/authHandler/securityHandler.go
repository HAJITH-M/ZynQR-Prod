package authhandler

import (
	"ZynQR-Server/internal/repository"
	authservice "ZynQR-Server/internal/service/authService"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func ListSessionsHandler(c *gin.Context) {
	userID, _ := c.Get("user_id")
	currentSessionID, _ := c.Get("session_id")
	uid, ok := userID.(string)
	if !ok || uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	sessions, err := repository.ListActiveSessionsForUserRepo(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load sessions"})
		return
	}

	cur, _ := currentSessionID.(string)
	out := make([]gin.H, 0, len(sessions))
	for _, s := range sessions {
		out = append(out, gin.H{
			"session_id":   s.SessionID,
			"device_info":  s.DeviceInfo,
			"ip_address":   s.IPAddress,
			"created_at":   s.CreatedAt.UTC().Format(time.RFC3339),
			"last_seen_at": s.UpdatedAt.UTC().Format(time.RFC3339),
			"is_current":   cur != "" && s.SessionID == cur,
		})
	}

	c.JSON(http.StatusOK, gin.H{"sessions": out})
}

func ListSecurityAuditLogHandler(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uid, ok := userID.(string)
	if !ok || uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	rows, err := repository.ListSecurityAuditLogsForUserRepo(uid, 100)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load audit log"})
		return
	}

	out := make([]gin.H, 0, len(rows))
	for _, r := range rows {
		out = append(out, gin.H{
			"id":         r.ID,
			"event_type": r.EventType,
			"status":     r.Status,
			"ip_address": r.IPAddress,
			"created_at": r.CreatedAt.UTC().Format(time.RFC3339),
		})
	}
	c.JSON(http.StatusOK, gin.H{"logs": out})
}

func RevokeSessionHandler(c *gin.Context) {
	userID, _ := c.Get("user_id")
	currentSessionID, _ := c.Get("session_id")
	uid, ok := userID.(string)
	if !ok || uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	targetID := strings.TrimSpace(c.Param("sessionId"))
	if targetID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "session id required"})
		return
	}

	sess, err := repository.GetSessionByIDForUserRepo(targetID, uid)
	if err != nil || sess == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		return
	}

	if sess.IsRevoked || time.Now().After(sess.ExpiresAt) {
		c.JSON(http.StatusOK, gin.H{"message": "session already revoked"})
		return
	}

	if err := repository.RevokeSessionRepo(targetID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to revoke session"})
		return
	}

	u := uid
	authservice.RecordSecurityAudit(&u, authservice.AuditEventSessionRevoke, authservice.AuditStatusSuccess, c.ClientIP(), c.Request.UserAgent())

	cur, _ := currentSessionID.(string)
	if cur != "" && targetID == cur {
		c.SetCookie("refresh_token", "", -1, "/api/v1/auth/refresh", "", false, true)
		c.JSON(http.StatusOK, gin.H{"message": "session revoked", "revoked_current": true})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "session revoked", "revoked_current": false})
}
