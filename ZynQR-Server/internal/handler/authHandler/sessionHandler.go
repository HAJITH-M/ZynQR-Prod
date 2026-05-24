package authhandler

import (
	"ZynQR-Server/internal/repository"
	authservice "ZynQR-Server/internal/service/authService"
	"ZynQR-Server/pkg/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RefreshHandler(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "refresh token missing"})
		return
	}

	result, err := authservice.RefreshTokenService(refreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.SetCookie(
		"refresh_token",
		result.RefreshToken,
		7*24*3600,
		"/api/v1/auth/refresh",
		"",
		false,
		true,
	)

	c.JSON(http.StatusOK, gin.H{
		"access_token": result.AccessToken,
	})
}

func LogoutHandler(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err == nil && refreshToken != "" {
		hash := utils.HashSecureToken(refreshToken)
		if sess, _ := repository.GetSessionByTokenHashRepo(hash); sess != nil {
			uid := sess.UserID
			authservice.RecordSecurityAudit(&uid, authservice.AuditEventLogout, authservice.AuditStatusSuccess, c.ClientIP(), c.Request.UserAgent())
		}
		_ = authservice.LogoutService(refreshToken)
	}

	c.SetCookie("refresh_token", "", -1, "/api/v1/auth/refresh", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "logged out successfully"})
}

func LogoutAllSessionsHandler(c *gin.Context) {
	userID, ok := c.Get("user_id")
	if ok {
		if uid, castOK := userID.(string); castOK && uid != "" {
			authservice.RecordSecurityAudit(&uid, authservice.AuditEventLogoutAll, authservice.AuditStatusSuccess, c.ClientIP(), c.Request.UserAgent())
			_ = authservice.LogoutAllSessionsService(uid)
		}
	}

	c.SetCookie("refresh_token", "", -1, "/api/v1/auth/refresh", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "all sessions logged out successfully"})
}

func UpdateVerificationEmailHandler(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusForbidden, gin.H{"error": "token not found"})
		return
	}

	if err := authservice.UpdateVerificationEmailService(token); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "email verified successfully",
	})
}
