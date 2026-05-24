package ratelimiter

import (
	autherrors "ZynQR-Server/internal/errors"
	ratelimiterservice "ZynQR-Server/internal/service/rateLimiterService"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RateLimiterMiddleware(rateLimitKey string, countLimit int64) gin.HandlerFunc {
	return func(c *gin.Context) {

		clientIP := c.ClientIP()

		err := ratelimiterservice.RateLimiterService(clientIP, rateLimitKey, countLimit)

		if err != nil {

			if errors.Is(err, autherrors.ErrRateLimitExceeded) {
				c.JSON(http.StatusTooManyRequests, gin.H{"error": "try again in 1 minute"})
				c.Abort()
				return
			}

			c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid credentials"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RateLimiterMiddlewareFailOpen applies the same per-IP cap but allows the request when Redis is unavailable.
func RateLimiterMiddlewareFailOpen(rateLimitKey string, countLimit int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()

		err := ratelimiterservice.RateLimiterService(clientIP, rateLimitKey, countLimit)
		if err != nil {
			if errors.Is(err, autherrors.ErrRateLimitExceeded) {
				c.JSON(http.StatusTooManyRequests, gin.H{"error": "try again in 1 minute"})
				c.Abort()
				return
			}
			c.Next()
			return
		}

		c.Next()
	}
}
