package router

import (
	qrhandler "ZynQR-Server/internal/handler/qrHandler"

	"github.com/gin-gonic/gin"
)

func SetUpRouter(r *gin.Engine) {
	r.GET("/qr/:id", qrhandler.RedirectQrHandler)

	api := r.Group("/api")
	{
		v1 := api.Group("/v1")
		{
			authRoutes(v1)
			contactRoutes(v1)
			qrRoutes(v1)
			staticQrRoutes(v1)
		}
	}
}
