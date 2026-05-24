package oauthhandler

import (
	"ZynQR-Server/internal/config/authconfig"
	"ZynQR-Server/internal/config/env"
	autherrors "ZynQR-Server/internal/errors"
	authservice "ZynQR-Server/internal/service/authService"
	oauthservice "ZynQR-Server/internal/service/oAuthService"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
)

// oauthFrontendBase returns the React app origin used for the post-callback redirect.
// Must be provided via FRONTEND_URL in the environment — no implicit fallback.
func oauthFrontendBase() string {
	return strings.TrimRight(strings.TrimSpace(env.AppEnv.FRONTEND_URL), "/")
}

// redirectOAuthError sends the user back to the React /oauth/callback route with an error code
// so the SPA can surface a toast and route them back to /login.
func redirectOAuthError(c *gin.Context, code string) {
	target := oauthFrontendBase() + "/oauth/callback?provider=google&error=" + url.QueryEscape(code)
	c.Redirect(http.StatusSeeOther, target)
}

func GoogleLogin(c *gin.Context) {
	url := authconfig.GoogleOAuthConfig().AuthCodeURL(
		"state-token",
		oauth2.AccessTypeOffline,
		oauth2.ApprovalForce,
	)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func GoogleCallback(c *gin.Context) {
	if oauthErr := c.Query("error"); oauthErr != "" {
		redirectOAuthError(c, oauthErr)
		return
	}

	code := c.Query("code")
	if code == "" {
		redirectOAuthError(c, "code_missing")
		return
	}

	token, err := authconfig.GoogleOAuthConfig().Exchange(context.Background(), code)
	if err != nil {
		redirectOAuthError(c, "token_exchange_failed")
		return
	}

	client := authconfig.GoogleOAuthConfig().Client(context.Background(), token)
	userResp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		redirectOAuthError(c, "userinfo_failed")
		return
	}
	defer userResp.Body.Close()

	var user map[string]interface{}
	if err := json.NewDecoder(userResp.Body).Decode(&user); err != nil {
		redirectOAuthError(c, "userinfo_decode_failed")
		return
	}

	googleID, _ := user["id"].(string)
	email, _ := user["email"].(string)
	name, _ := user["name"].(string)
	picture, _ := user["picture"].(string)
	if googleID == "" || email == "" {
		redirectOAuthError(c, "userinfo_incomplete")
		return
	}

	var oauthTokenExpiry *time.Time
	if !token.Expiry.IsZero() {
		expiry := token.Expiry
		oauthTokenExpiry = &expiry
	}

	loginRes, err := oauthservice.GoogleOAuthLoginService(
		oauthservice.GoogleUser{
			ID:      googleID,
			Email:   email,
			Name:    name,
			Picture: picture,
		},
		token.RefreshToken,
		oauthTokenExpiry,
		c.ClientIP(),
		c.Request.UserAgent(),
	)
	if err != nil {
		switch {
		case errors.Is(err, autherrors.ErrEmailNotVerified):
			redirectOAuthError(c, "email_not_verified")
		case errors.Is(err, autherrors.ErrAccountNotActive):
			redirectOAuthError(c, "account_not_active")
		case errors.Is(err, autherrors.ErrChangePasswordRequired):
			redirectOAuthError(c, "change_password_required")
		default:
			redirectOAuthError(c, "invalid_credentials")
		}
		return
	}

	uid := loginRes.UserId
	authservice.RecordSecurityAudit(&uid, authservice.AuditEventOAuthLogin, authservice.AuditStatusSuccess, c.ClientIP(), c.Request.UserAgent())

	c.SetCookie(
		"refresh_token",
		loginRes.RefreshToken,
		7*24*3600,
		"/api/v1/auth/refresh",
		"",
		false,
		true,
	)

	redirectURL := oauthFrontendBase() + "/oauth/callback?provider=google" +
		"&user_id=" + url.QueryEscape(loginRes.UserId) +
		"&email=" + url.QueryEscape(loginRes.Email) +
		"&display_name=" + url.QueryEscape(loginRes.DisplayName) +
		"&access_token=" + url.QueryEscape(loginRes.AccessToken)
	c.Redirect(http.StatusSeeOther, redirectURL)
}
