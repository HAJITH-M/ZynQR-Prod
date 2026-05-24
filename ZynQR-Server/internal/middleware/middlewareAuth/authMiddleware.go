package middlewareauth

import (
	"net/http"
	"strings"

	"ZynQR-Server/internal/config/env"
	"ZynQR-Server/internal/repository"
	tokenjwt "ZynQR-Server/pkg/tokenJWT"

	"github.com/gin-gonic/gin"
)

func MiddleWareAuth() gin.HandlerFunc {
	return func(c *gin.Context) {

		var tokenString string

		// 1. Try Authorization Header (Bearer Token)
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		}

		// 2. Optional: fallback to cookie (if you want)
		if tokenString == "" {
			cookieToken, err := c.Cookie("access_token")
			if err == nil {
				tokenString = cookieToken
			}
		}

		// 3. If no token found
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "authorization token required",
			})
			return
		}

		// 4. Validate token
		claims, err := tokenjwt.ValidateToken(tokenString, env.AppEnv.JWT_SECRECT)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid or expired token",
			})
			return
		}

		// 5. Enforce that token belongs to a live session.
		if claims.SessionID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid session",
			})
			return
		}

		session, err := repository.GetActiveSessionByIDRepo(claims.SessionID)
		if err != nil || session == nil || session.UserID != claims.UserID {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "session expired or revoked",
			})
			return
		}

		// 6. Store user info in context
		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("session_id", claims.SessionID)

		// Continue request
		c.Next()
	}
}
