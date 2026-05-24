package middleware

import (
	"ZynQR-Server/internal/middleware/cors"
	middleware "ZynQR-Server/internal/middleware/logger"

	"github.com/gin-gonic/gin"
)

func Setup(r *gin.Engine) {
	r.Use(gin.Recovery())
	r.Use(middleware.Logger())
	r.Use(cors.CorsMiddleware())
}
