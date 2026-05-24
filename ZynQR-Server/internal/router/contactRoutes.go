package router

import (
	contacthandler "ZynQR-Server/internal/handler/contactHandler"
	ratelimiter "ZynQR-Server/internal/middleware/rateLimiter"

	"github.com/gin-gonic/gin"
)

func contactRoutes(rg *gin.RouterGroup) {
	contact := rg.Group("/contact")
	contact.Use(ratelimiter.RateLimiterMiddlewareFailOpen("contactRateLimit:", 5))
	{
		contact.POST("", contacthandler.SubmitContactHandler)
	}
}
