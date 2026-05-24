package router

import (
	staticqrhandler "ZynQR-Server/internal/handler/staticQrHandler"
	middlewareauth "ZynQR-Server/internal/middleware/middlewareAuth"
	ratelimiter "ZynQR-Server/internal/middleware/rateLimiter"

	"github.com/gin-gonic/gin"
)

func staticQrRoutes(rg *gin.RouterGroup) {
	g := rg.Group("/static-qr")
	g.Use(middlewareauth.MiddleWareAuth())

	g.GET("/list", staticqrhandler.ListStaticQrHandler)

	w := g.Group("")
	w.Use(ratelimiter.RateLimiterMiddleware("qrWriteRateLimit:", 120))
	{
		w.POST("/create", staticqrhandler.CreateStaticQrHandler)
		w.DELETE("/:id", staticqrhandler.DeleteStaticQrHandler)
	}
}
