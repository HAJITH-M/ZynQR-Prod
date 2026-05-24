package authservice

import (
	"ZynQR-Server/internal/config/env"
	autherrors "ZynQR-Server/internal/errors"
	authmodel "ZynQR-Server/internal/model/AuthModel"
	"ZynQR-Server/internal/repository"
	"ZynQR-Server/pkg/mailer"
	"ZynQR-Server/pkg/redis"
	"ZynQR-Server/pkg/utils"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

const login2FATTL = 5 * time.Minute

// Login2FAChallengePayload is stored in Redis for the second login step.
type Login2FAChallengePayload struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	IP     string `json:"ip"`
	Device string `json:"device"`
}

// StartLoginTwoFactor validates that 2FA is on, stores a ticket + OTP hash, emails the OTP.
func StartLoginTwoFactor(user *authmodel.User, input LoginInput) (ticket string, err error) {
	if user == nil || !user.TwoFactorEnabled {
		return "", autherrors.ErrInvalidCredentials
	}

	ticket = uuid.NewString()
	payload := Login2FAChallengePayload{
		UserID: user.ID,
		Email:  user.Email,
		IP:     input.IPAddress,
		Device: input.Device,
	}
	raw, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	if err := redis.SetLogin2FAChallenge(ticket, string(raw), login2FATTL); err != nil {
		return "", err
	}

	otpStr, err := utils.GenerateOTP()
	fmt.Println("otpStr-v", otpStr)
	if err != nil {
		redis.DeleteLogin2FAKeys(ticket)
		return "", err
	}

	otpHash, err := utils.GeneratePasswordWithHash(otpStr)
	if err != nil {
		redis.DeleteLogin2FAKeys(ticket)
		return "", err
	}

	if err := redis.SetLogin2FAOtpHash(ticket, otpHash, login2FATTL); err != nil {
		redis.DeleteLogin2FAKeys(ticket)
		return "", err
	}

	// Local/dev: print OTP to the process stdout (e.g. Air) when SMTP is flaky or for quick testing.
	if env.AppEnv.APP_ENV != "production" {
		fmt.Printf("\n[ZynQR 2FA] email=%s otp=%s ticket=%s\n\n", user.Email, otpStr, ticket)
	}

	if err := mailer.SendLogin2FAOtpEmail(user.Email, otpStr); err != nil {
		redis.DeleteLogin2FAKeys(ticket)
		return "", fmt.Errorf("%w: %v", autherrors.ErrLogin2FAFailedToSend, err)
	}

	return ticket, nil
}

// CompleteLoginTwoFactor verifies the ticket + OTP and issues tokens.
func CompleteLoginTwoFactor(ticket, otpPlain string) (*LoginResult, error) {
	if ticket == "" || otpPlain == "" {
		return nil, autherrors.ErrLogin2FAInvalidTicket
	}

	raw, err := redis.GetLogin2FAChallenge(ticket)
	if err != nil {
		return nil, err
	}
	if raw == "" {
		return nil, autherrors.ErrLogin2FAInvalidTicket
	}

	var payload Login2FAChallengePayload
	if err := json.Unmarshal([]byte(raw), &payload); err != nil {
		return nil, autherrors.ErrLogin2FAInvalidTicket
	}

	attempts, err := redis.IncrLogin2FAAttempts(ticket, login2FATTL)
	if err != nil {
		return nil, err
	}
	if attempts > 5 {
		redis.DeleteLogin2FAKeys(ticket)
		return nil, autherrors.ErrTooManyOtpAttempts
	}

	hash, err := redis.GetLogin2FAOtpHash(ticket)
	if err != nil {
		return nil, err
	}
	if hash == "" {
		return nil, autherrors.ErrLogin2FAInvalidTicket
	}

	if err := utils.CompareHashedPassword(hash, otpPlain); err != nil {
		return nil, autherrors.ErrInvalidOTP
	}

	redis.DeleteLogin2FAKeys(ticket)

	user, err := repository.GetUserByIDRepo(payload.UserID)
	if err != nil || user == nil {
		return nil, autherrors.ErrUserNotFound
	}

	if user.AccountStatus != "active" {
		return nil, autherrors.ErrAccountNotActive
	}

	return IssueLoginSession(user, payload.IP, payload.Device)
}
