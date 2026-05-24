package router

import (
	authhandler "ZynQR-Server/internal/handler/authHandler"
	oauthhandler "ZynQR-Server/internal/handler/oAuthHandler"
	middlewareauth "ZynQR-Server/internal/middleware/middlewareAuth"
	ratelimiter "ZynQR-Server/internal/middleware/rateLimiter"

	"github.com/gin-gonic/gin"
)

func authRoutes(rg *gin.RouterGroup) {
	auth := rg.Group("/auth")

	// OAuth redirects — do not apply the login POST rate limiter here.
	auth.GET("/google", oauthhandler.GoogleLogin)
	auth.GET("/google/callback", oauthhandler.GoogleCallback)

	limited := auth.Group("")
	limited.Use(ratelimiter.RateLimiterMiddleware("loginRateLimit:", 6))
	{
		limited.POST("/google/refresh", oauthhandler.RefreshAccessToken)
		limited.POST("/register", authhandler.RegisterHandler)
		limited.POST("/login", authhandler.LoginHandler)
		limited.POST("/login/2fa", authhandler.Login2FAVerifyHandler)
		limited.POST("/refresh", authhandler.RefreshHandler)
		limited.POST("/logout", authhandler.LogoutHandler)
		limited.GET("/verification-email", authhandler.UpdateVerificationEmailHandler)
		limited.POST("/change-password", authhandler.ChangePasswordHandler)
		limited.POST("/forgot-password", authhandler.ForgotPasswordHandler)
		limited.POST("/forgot-password-verify", authhandler.VerifyForgotPasswordHandler)
		limited.POST("/forgot-password-update", authhandler.ForgotPasswordUpdateHandler)
	}

	protected := auth.Group("")
	protected.Use(middlewareauth.MiddleWareAuth())
	{
		protected.GET("/me", authhandler.MeHandler)
		protected.PATCH("/me", authhandler.UpdateMeProfileHandler)
		protected.PATCH("/two-factor", authhandler.UpdateTwoFactorHandler)
		protected.GET("/sessions", authhandler.ListSessionsHandler)
		protected.GET("/security-audit-log", authhandler.ListSecurityAuditLogHandler)
		protected.POST("/sessions/:sessionId/revoke", authhandler.RevokeSessionHandler)
		protected.POST("/logout-all", authhandler.LogoutAllSessionsHandler)
		protected.POST("/delete-account", authhandler.DeleteAccountHandler)
	}
}
