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

func ChangePasswordHandler(c *gin.Context) {
	var req ChangePasswordRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationErrors(err)})
		return
	}

	err := authservice.ChangePasswordService(authservice.ChangePasswordInput{
		Email:       req.Email,
		OldPassword: req.OldPassword,
		NewPassword: req.NewPassword,
	})

	if err != nil {
		if errors.Is(err, autherrors.ErrOldPasswordDoesntMatch) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		if errors.Is(err, autherrors.ErrNewPasswordShouldDifferFromOld) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Old and New Password are same"})
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if u, _ := repository.GetUserByEmailRepo(req.Email); u != nil {
		uid := u.ID
		authservice.RecordSecurityAudit(&uid, authservice.AuditEventPasswordChange, authservice.AuditStatusSuccess, c.ClientIP(), c.Request.UserAgent())
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}

func ForgotPasswordHandler(c *gin.Context) {
	var req ForgotPasswordRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationErrors(err)})
		return
	}

	if err := authservice.ForgotPasswordService(req.Email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "OTP sent successfully"})
}

func VerifyForgotPasswordHandler(c *gin.Context) {
	var req VerifyForgotPasswordOtpRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationErrors(err)})
		return
	}

	err := authservice.VerifyForgotPasswordOtp(req.Email, req.Otp)
	if err != nil {
		if errors.Is(err, autherrors.ErrInvalidOTP) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "OTP Verification Success"})
}

func ForgotPasswordUpdateHandler(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationErrors(err)})
		return
	}

	err := authservice.ForgotPasswordUpdateService(req.Email, req.Password)
	if err != nil {
		if errors.Is(err, autherrors.ErrNewPasswordSameAsCurrent) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": autherrors.ErrFailedToUpdatePassword.Error()})
		return
	}

	if u, _ := repository.GetUserByEmailRepo(req.Email); u != nil {
		uid := u.ID
		authservice.RecordSecurityAudit(&uid, authservice.AuditEventPasswordReset, authservice.AuditStatusSuccess, c.ClientIP(), c.Request.UserAgent())
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}
