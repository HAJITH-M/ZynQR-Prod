package authhandler

import (
	autherrors "ZynQR-Server/internal/errors"
	"ZynQR-Server/internal/repository"
	authservice "ZynQR-Server/internal/service/authService"
	"ZynQR-Server/pkg/utils"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

func LoginHandler(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationErrors(err)})
		return
	}

	// Check if user exists and has only a Google provider — block password login.
	userByEmail, err := repository.GetUserByEmailRepo(req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid credentials"})
		return
	}
	if userByEmail != nil {
		googleMethod, err := repository.GetAuthenticationMethodByUserAndProviderRepo(userByEmail.ID, "google")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid credentials"})
			return
		}
		passwordMethod, err := repository.GetAuthenticationMethodByUserAndProviderRepo(userByEmail.ID, "password")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid credentials"})
			return
		}

		// Google-only user trying to login with password.
		// use Google, or set a password through the Forgot Password flow.
		// Safe to surface this hint because the email is already known to exist with a Google method.
		if googleMethod != nil && passwordMethod == nil {
			uid := userByEmail.ID
			authservice.RecordSecurityAudit(&uid, authservice.AuditEventLoginFailed, authservice.AuditStatusFailed, c.ClientIP(), c.Request.UserAgent())
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":    "invalid credentials",
				"hint":     "This account was created using Google. Sign in with Google, or use Forgot Password to set a password for this email.",
				"provider": "google",
			})
			return
		}
	}

	loginIn := authservice.LoginInput{
		Email:     req.Email,
		Password:  req.Password,
		IPAddress: c.ClientIP(),
		Device:    c.Request.UserAgent(),
	}

	user, err := authservice.ValidatePasswordCredentials(loginIn)
	if err != nil {
		if errors.Is(err, autherrors.ErrEmailNotVerified) ||
			errors.Is(err, autherrors.ErrAccountNotActive) ||
			errors.Is(err, autherrors.ErrChangePasswordRequired) {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		if errors.Is(err, autherrors.ErrInvalidCredentials) {
			if u, _ := repository.GetUserByEmailRepo(req.Email); u != nil {
				uid := u.ID
				authservice.RecordSecurityAudit(&uid, authservice.AuditEventLoginFailed, authservice.AuditStatusFailed, c.ClientIP(), c.Request.UserAgent())
			}
			c.JSON(http.StatusUnauthorized, gin.H{"error": autherrors.ErrInvalidCredentials.Error()})
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": autherrors.ErrInvalidCredentials.Error()})
		return
	}

	if user.TwoFactorEnabled {
		ticket, err2FA := authservice.StartLoginTwoFactor(user, loginIn)
		if err2FA != nil {
			uid := user.ID
			authservice.RecordSecurityAudit(&uid, authservice.AuditEventLoginFailed, authservice.AuditStatusFailed, c.ClientIP(), c.Request.UserAgent())
			if errors.Is(err2FA, autherrors.ErrLogin2FAFailedToSend) {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err2FA.Error()})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not start two-factor verification"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"requires_two_factor": true,
			"two_factor_ticket":   ticket,
			"message":             "We sent a verification code to your email. Enter it to finish signing in.",
		})
		return
	}

	res, err := authservice.IssueLoginSession(user, loginIn.IPAddress, loginIn.Device)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": autherrors.ErrInvalidCredentials.Error()})
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
