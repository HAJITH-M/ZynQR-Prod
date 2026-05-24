package router

import (
	qrhandler "ZynQR-Server/internal/handler/qrHandler"
	middlewareauth "ZynQR-Server/internal/middleware/middlewareAuth"
	ratelimiter "ZynQR-Server/internal/middleware/rateLimiter"

	"github.com/gin-gonic/gin"
)

func qrRoutes(rg *gin.RouterGroup) {
	qr := rg.Group("/qr")
	qr.Use(middlewareauth.MiddleWareAuth())

	// Reads: no global rate limit — the dashboard mounts several queries (list, activity, growth, etc.),
	// React Query refetch, and dev HMR can burst; limiting GETs caused 429 in normal use.
	{
		qr.GET("/get", qrhandler.GetAllQrHandler)
		qr.GET("/activity", qrhandler.GetQrActivityHandler)
		qr.GET("/scans/:id", qrhandler.GetQrScansHandler)
		qr.GET("/analytics/summary", qrhandler.GetQrAnalyticsSummaryHandler)
		qr.GET("/analytics/growth", qrhandler.GetQrAnalyticsGrowthHandler)
		qr.GET("/analytics/scan-frequency/:id", qrhandler.GetQrScanFrequencyHandler)
	}

	// Writes: still throttled per IP to slow abuse (create/update/delete).
	qrWrite := qr.Group("")
	qrWrite.Use(ratelimiter.RateLimiterMiddleware("qrWriteRateLimit:", 120))
	{
		qrWrite.POST("/create", qrhandler.CreateQrHandler)
		qrWrite.PUT("/update/:id", qrhandler.UpdateQrHandler)
		qrWrite.DELETE("/delete", qrhandler.DeleteQrHandler)
	}
}
