package ratelimiterservice

import (
	autherrors "ZynQR-Server/internal/errors"
	"ZynQR-Server/pkg/redis"
	"time"
)

func RateLimiterService(clientIP string, rateLimitKey string, countLimit int64) error {

	attempts, err := redis.RateLimiterRedis(clientIP, rateLimitKey, time.Minute)
	if err != nil {
		return autherrors.ErrRateLimiterRedis
	}

	// Block only after the window has exceeded the cap (allows exactly countLimit successful checks per TTL).
	if attempts > countLimit {
		return autherrors.ErrRateLimitExceeded
	}

	return nil
}
