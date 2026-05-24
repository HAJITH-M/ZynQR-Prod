package redis

import (
	redisconfig "ZynQR-Server/internal/config/redisConfig"
	"ZynQR-Server/pkg/utils"
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

func StoreOtp(email string, otp string, expirationTime time.Duration) error {
	ctx := context.Background()

	otpHashed, err := utils.GeneratePasswordWithHash(otp)
	if err != nil {
		return err
	}

	otpCoolDown := "otp_cooldown:" + email

	err = redisconfig.RDB.Set(ctx, otpCoolDown, "1", 30*time.Second).Err()
	if err != nil {
		return err
	}

	err = redisconfig.RDB.Set(ctx, email, otpHashed, expirationTime).Err()
	if err != nil {
		return err

	}

	fmt.Print(redisconfig.RDB.Get(ctx, email).Result())

	return nil
}

func GetOtp(OtpEmail string) (string, error) {

	ctx := context.Background()

	val, err := redisconfig.RDB.Get(ctx, OtpEmail).Result()

	if err == redis.Nil {
		// OTP not found (expired or not created)
		return "", nil
	} else if err != nil {
		return "", err
	}

	return val, nil
}

func DeleteOtp(key string) error {

	ctx := context.Background()

	return redisconfig.RDB.Del(ctx, key).Err()
}

func CheckOtpCooldown(email string) (bool, error) {
	ctx := context.Background()

	// cooldown key must match the key used in StoreOtp:
	// otpCoolDown := "otp_cooldown:" + emailParam
	// where emailParam is currently passed as "otp:"+email from ForgotPasswordService.
	// So here we need to check "otp_cooldown:otp:<email>".
	key := "otp_cooldown:otp:" + email

	exists, err := redisconfig.RDB.Exists(ctx, key).Result()
	if err != nil {
		return false, err
	}

	return exists == 1, nil
}

func IncrOtpAttempts(email string, otpTTL time.Duration) (int64, error) {
	ctx := context.Background()
	key := "otp:attempts:" + email

	attempts, err := redisconfig.RDB.Incr(ctx, key).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to increment attempts: %w", err)
	}
	if attempts == 1 {
		redisconfig.RDB.Expire(ctx, key, otpTTL)
	}

	return attempts, nil
}

func DeleteOtpAttempts(email string) {
	ctx := context.Background()
	redisconfig.RDB.Del(ctx, "otp:attempts:"+email)
}

const (
	login2FAChallengeKeyPrefix = "login2fa:ch:"
	login2FAOtpKeyPrefix       = "login2fa:otp:"
	login2FAAttemptsKeyPrefix  = "login2fa:attempts:"
)

// SetLogin2FAChallenge stores JSON payload for a pending 2FA login (ticket from step 1).
func SetLogin2FAChallenge(ticket, payloadJSON string, ttl time.Duration) error {
	ctx := context.Background()
	return redisconfig.RDB.Set(ctx, login2FAChallengeKeyPrefix+ticket, payloadJSON, ttl).Err()
}

// GetLogin2FAChallenge returns stored JSON or empty string if missing.
func GetLogin2FAChallenge(ticket string) (string, error) {
	ctx := context.Background()
	val, err := redisconfig.RDB.Get(ctx, login2FAChallengeKeyPrefix+ticket).Result()
	if err == redis.Nil {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	return val, nil
}

// DeleteLogin2FAChallenge removes the pending-login ticket.
func DeleteLogin2FAChallenge(ticket string) error {
	ctx := context.Background()
	return redisconfig.RDB.Del(ctx, login2FAChallengeKeyPrefix+ticket).Err()
}

// SetLogin2FAOtpHash stores the bcrypt hash of the login OTP for this ticket.
func SetLogin2FAOtpHash(ticket, otpHash string, ttl time.Duration) error {
	ctx := context.Background()
	return redisconfig.RDB.Set(ctx, login2FAOtpKeyPrefix+ticket, otpHash, ttl).Err()
}

func GetLogin2FAOtpHash(ticket string) (string, error) {
	ctx := context.Background()
	val, err := redisconfig.RDB.Get(ctx, login2FAOtpKeyPrefix+ticket).Result()
	if err == redis.Nil {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	return val, nil
}

func DeleteLogin2FAOtp(ticket string) error {
	ctx := context.Background()
	return redisconfig.RDB.Del(ctx, login2FAOtpKeyPrefix+ticket).Err()
}

// IncrLogin2FAAttempts tracks OTP guess attempts per ticket.
func IncrLogin2FAAttempts(ticket string, ttl time.Duration) (int64, error) {
	ctx := context.Background()
	key := login2FAAttemptsKeyPrefix + ticket
	n, err := redisconfig.RDB.Incr(ctx, key).Result()
	if err != nil {
		return 0, err
	}
	if n == 1 {
		redisconfig.RDB.Expire(ctx, key, ttl)
	}
	return n, nil
}

func DeleteLogin2FAAttempts(ticket string) {
	ctx := context.Background()
	redisconfig.RDB.Del(ctx, login2FAAttemptsKeyPrefix+ticket)
}

// DeleteLogin2FAKeys clears challenge, OTP, and attempts for a ticket.
func DeleteLogin2FAKeys(ticket string) {
	_ = DeleteLogin2FAChallenge(ticket)
	_ = DeleteLogin2FAOtp(ticket)
	DeleteLogin2FAAttempts(ticket)
}

func RateLimiterRedis(clientIP string, rateLimitKey string, rateLimitTTL time.Duration) (int64, error) {
	ctx := context.Background()
	key := rateLimitKey + clientIP

	attempts, err := redisconfig.RDB.Incr(ctx, key).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to increment attempts: %w", err)
	}

	if attempts == 1 {
		redisconfig.RDB.Expire(ctx, key, rateLimitTTL)
	}

	return attempts, nil
}
