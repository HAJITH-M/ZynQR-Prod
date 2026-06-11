package app

import (
	"ZynQR-Server/internal/config/env"
	redisconfig "ZynQR-Server/internal/config/redisConfig"
	"ZynQR-Server/internal/middleware"
	"ZynQR-Server/internal/router"
	"ZynQR-Server/migrations"
	"ZynQR-Server/pkg/database"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
)

var (
	bootstrapOnce sync.Once
	handler       http.Handler
	bootstrapErr  error
)

func Handler() (http.Handler, error) {
	bootstrapOnce.Do(func() {
		gin.SetMode(gin.ReleaseMode)

		r := gin.New()
		// We resolve the real client IP ourselves in the clientip middleware
		// (see internal/middleware/setup.go), so we don't need Gin to trust
		// any specific proxy CIDR. The middleware rewrites RemoteAddr to the
		// public client IP, and SetTrustedProxies(nil) keeps c.ClientIP() from
		// second-guessing it via header parsing.
		_ = r.SetTrustedProxies(nil)

		env.Load()
		redisconfig.RedisConfig()

		if err := database.Connect(); err != nil {
			bootstrapErr = err
			return
		}

		if err := migrations.Migrate(); err != nil {
			bootstrapErr = err
			log.Printf("database migration failed: %v", err)
			return
		}

		log.Println("Database connected successfully")
		middleware.Setup(r)
		router.SetUpRouter(r)

		// r.GET("/", func(c *gin.Context) {
		// 	c.JSON(http.StatusOK, gin.H{"message": "Hello I'm ZynQR-Server Backend"})
		// })

		handler = r
	})

	return handler, bootstrapErr
}
