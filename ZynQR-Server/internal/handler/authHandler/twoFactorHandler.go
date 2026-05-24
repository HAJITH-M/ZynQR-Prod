package authhandler

import (
	autherrors "ZynQR-Server/internal/errors"
	authmodel "ZynQR-Server/internal/model/AuthModel"
	"ZynQR-Server/internal/repository"
	authservice "ZynQR-Server/internal/service/authService"
	"ZynQR-Server/pkg/utils"
	"errors"
	"net/http"
	"strings"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
)

// Login2FAVerifyHandler completes password login after OTP (step 2).
func Login2FAVerifyHandler(c *gin.Context) {
	var req Login2FAVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationErrors(err)})
		return
	}

	res, err := authservice.CompleteLoginTwoFactor(req.TwoFactorTicket, req.Otp)
	if err != nil {
		if errors.Is(err, autherrors.ErrInvalidOTP) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": autherrors.ErrInvalidOTP.Error()})
			return
		}
		if errors.Is(err, autherrors.ErrTooManyOtpAttempts) {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": autherrors.ErrTooManyOtpAttempts.Error()})
			return
		}
		if errors.Is(err, autherrors.ErrLogin2FAInvalidTicket) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": autherrors.ErrLogin2FAInvalidTicket.Error()})
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": autherrors.ErrLogin2FAInvalidTicket.Error()})
		return
	}

	uid := res.UserId
	authservice.RecordSecurityAudit(&uid, authservice.AuditEventLogin, authservice.AuditStatusSuccess, c.ClientIP(), c.Request.UserAgent())

	c.SetCookie(
		"refresh_token",
		res.RefreshToken,
		7*24*3600,
		"/api/v1/auth/refresh",
		"",
		false,
		true,
	)
	c.JSON(http.StatusOK, gin.H{
		"message":      "login successful",
		"access_token": res.AccessToken,
		"user": gin.H{
			"user_id":      res.UserId,
			"email":        res.Email,
			"display_name": res.DisplayName,
		},
	})
}

// MeHandler returns the current user profile (incl. 2FA flag).
func MeHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	user, err := repository.GetUserByIDRepo(userID)
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, meProfileJSON(user))
}

func meProfileJSON(user *authmodel.User) gin.H {
	return gin.H{
		"user_id":             user.ID,
		"email":               user.Email,
		"display_name":        user.DisplayName,
		"two_factor_enabled":  user.TwoFactorEnabled,
		"email_verified":      user.EmailVerified,
		"profile_picture_url": user.ProfilePictureURL,
	}
}

// UpdateMeProfileHandler updates profile fields for the authenticated user (display name).
func UpdateMeProfileHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	var req UpdateMeProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationErrors(err)})
		return
	}
	name := strings.TrimSpace(req.DisplayName)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"display_name": "display name cannot be empty"}})
		return
	}
	if utf8.RuneCountInString(name) < 3 {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"display_name": "display name must be at least 3 characters"}})
		return
	}
	if utf8.RuneCountInString(name) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": gin.H{"display_name": "display name must be at most 100 characters"}})
		return
	}
	if err := repository.UpdateUserDisplayNameRepo(userID, name); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}
	user, err := repository.GetUserByIDRepo(userID)
	if err != nil || user == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, meProfileJSON(user))
}

// UpdateTwoFactorHandler enables or disables email OTP on password login.
func UpdateTwoFactorHandler(c *gin.Context) {
	var req UpdateTwoFactorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationErrors(err)})
		return
	}
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	if err := repository.UpdateUserTwoFactorEnabledRepo(userID, req.Enabled); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update two-factor setting"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message":            "two-factor setting updated",
		"two_factor_enabled": req.Enabled,
	})
}
