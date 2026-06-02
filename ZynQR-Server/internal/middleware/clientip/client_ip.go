// Package clientip provides a Gin middleware that resolves the real client IP
// from forwarded headers and rewrites *http.Request.RemoteAddr so that every
// downstream c.ClientIP() callsite (rate limiter, audit logs, etc.) returns
// the public IP without each handler re-implementing the logic.
//
// Why a middleware instead of just gin.Engine.TrustedPlatform?
//   - Vercel's X-Forwarded-For carries the full "client, internal-lb" chain.
//     TrustedPlatform returns the raw header value (chain and all), which then
//     breaks varchar columns and downstream geocoders.
//   - TrustedProxies requires knowing the proxy CIDR, which is unknown on
//     serverless platforms.
//
// We instead read every well-known header in priority order, validate the
// candidate is a real public IP, and only then write it back. If nothing
// usable is found we leave RemoteAddr alone.
package clientip

import (
	"net"
	"strings"

	"github.com/gin-gonic/gin"
)

// headerPriority is the order in which forwarded-IP headers are consulted.
// First public, parseable address wins.
var headerPriority = []string{
	"X-Vercel-Forwarded-For", // Vercel's own pre-rewritten chain
	"X-Real-IP",              // Vercel + many reverse proxies
	"CF-Connecting-IP",       // Cloudflare
	"True-Client-IP",         // Akamai / Cloudflare Enterprise
	"Fly-Client-IP",          // Fly.io
	"X-Forwarded-For",        // RFC standard (left-most entry)
}

// Middleware returns a gin.HandlerFunc that normalizes the client IP.
func Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ip := resolve(c); ip != "" {
			// RemoteAddr is what c.ClientIP() ultimately falls back to when
			// trusted proxies are nil. Setting it here makes c.ClientIP()
			// return our resolved value everywhere.
			c.Request.RemoteAddr = ip + ":0"
		}
		c.Next()
	}
}

func resolve(c *gin.Context) string {
	for _, h := range headerPriority {
		raw := strings.TrimSpace(c.GetHeader(h))
		if raw == "" {
			continue
		}
		if comma := strings.IndexByte(raw, ','); comma >= 0 {
			raw = strings.TrimSpace(raw[:comma])
		}
		if host, _, err := net.SplitHostPort(raw); err == nil {
			raw = host
		}
		ip := net.ParseIP(raw)
		if ip == nil || ip.IsLoopback() || ip.IsUnspecified() || ip.IsPrivate() {
			continue
		}
		return ip.String()
	}
	return ""
}
