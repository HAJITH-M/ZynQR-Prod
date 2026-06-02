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
		// Running behind Vercel's edge proxy: the real client IP is in
		// X-Forwarded-For. TrustedPlatform makes c.ClientIP() read that header
		// directly (bypassing the TrustedProxies CIDR check, which is unknown
		// in serverless). Without this, c.ClientIP() returns Vercel's internal
		// peer address and ip_geo lookups skip as "private LAN IP".
		r.TrustedPlatform = "X-Forwarded-For"

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

		r.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "Hello I'm ZynQR-Server Backend"})
		})

		handler = r
	})

	return handler, bootstrapErr
}
