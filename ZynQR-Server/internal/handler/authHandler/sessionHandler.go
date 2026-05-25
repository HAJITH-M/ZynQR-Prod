package authhandler

import (
	"ZynQR-Server/internal/config/env"
	"ZynQR-Server/internal/repository"
	authservice "ZynQR-Server/internal/service/authService"
	"ZynQR-Server/pkg/utils"
	"net/http"
	"net/url"
	"strings"

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

// UpdateVerificationEmailHandler is hit when the user clicks the verification
// link in their email. Browsers follow that link directly, so we redirect to
// the frontend login page (with a status query param) instead of returning raw
// JSON — that JSON would otherwise be shown on the API host, confusing the user.
func UpdateVerificationEmailHandler(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		redirectVerificationResult(c, "missing_token")
		return
	}

	if err := authservice.UpdateVerificationEmailService(token); err != nil {
		redirectVerificationResult(c, "invalid_or_expired")
		return
	}

	redirectVerificationResult(c, "")
}

// redirectVerificationResult sends the browser to the dedicated frontend page
// <FRONTEND_URL>/email-verified — with no params on success, or `?error=<code>`
// when the token was missing/expired so the page can show the failure variant.
func redirectVerificationResult(c *gin.Context, errCode string) {
	base := strings.TrimRight(strings.TrimSpace(env.AppEnv.FRONTEND_URL), "/")
	if base == "" {
		// FRONTEND_URL not configured — fall back to a JSON response so the
		// failure is visible and we never redirect to a relative URL.
		if errCode == "" {
			c.JSON(http.StatusOK, gin.H{"message": "email verified successfully"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": errCode})
		}
		return
	}

	target := base + "/email-verified"
	if errCode != "" {
		target += "?error=" + url.QueryEscape(errCode)
	}
	c.Redirect(http.StatusSeeOther, target)
}
