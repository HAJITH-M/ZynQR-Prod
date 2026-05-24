package authservice

import (
	autherrors "ZynQR-Server/internal/errors"
	"ZynQR-Server/internal/repository"
	"ZynQR-Server/pkg/mailer"
	"ZynQR-Server/pkg/redis"
	"ZynQR-Server/pkg/utils"
	"fmt"
	"time"
)

func ForgotPasswordService(email string) error {
	cooldown, err := redis.CheckOtpCooldown(email)
	if err != nil {
		return err
	}

	if cooldown {
		return autherrors.ErrOtpCooldown
	}

	otpStr, err := utils.GenerateOTP()
	if err != nil {
		return err
	}

	ctx := "otp:" + email
	err = redis.StoreOtp(ctx, otpStr, 5*time.Minute)
	if err != nil {
		return autherrors.ErrFailedToStoreOTP
	}

	err = repository.UpdateUserAccountStatusRepo(email, "pending_otp")
	if err != nil {
		return err
	}

	// Send synchronously so serverless (e.g. Vercel) does not terminate before SMTP completes.
	if err := mailer.SendOtpEmail(email, otpStr); err != nil {
		return fmt.Errorf("%w: %v", autherrors.ErrFailedToSendOTPEmail, err)
	}

	return nil
}

func VerifyForgotPasswordOtp(email string, otp string) error {
	attempts, err := redis.IncrOtpAttempts(email, 5*time.Minute)
	if err != nil {
		return err
	}
	if attempts > 3 {
		redis.DeleteOtp("otp:" + email)
		redis.DeleteOtpAttempts(email)
		return autherrors.ErrTooManyOtpAttempts
	}

	getOtp, err := redis.GetOtp("otp:" + email)
	if err != nil {
		return err
	}

	err = utils.CompareHashedPassword(getOtp, otp)
	if err != nil {
		return autherrors.ErrInvalidOTP
	}

	err = redis.DeleteOtp("otp:" + email)
	if err != nil {
		return err
	}

	redis.DeleteOtpAttempts(email)
	return nil
}
