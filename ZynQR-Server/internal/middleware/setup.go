package middleware

import (
	"ZynQR-Server/internal/middleware/clientip"
	"ZynQR-Server/internal/middleware/cors"
	middleware "ZynQR-Server/internal/middleware/logger"

	"github.com/gin-gonic/gin"
)

func Setup(r *gin.Engine) {
	r.Use(gin.Recovery())
	// Resolve the real client IP from forwarded headers BEFORE anything else
	// runs, so downstream middleware (logger, rate limiter) and handlers
	// (audit logs, redirect tracking) all see the public client IP via
	// c.ClientIP() instead of an internal load-balancer address.
	r.Use(clientip.Middleware())
	r.Use(middleware.Logger())
	r.Use(cors.CorsMiddleware())
}
