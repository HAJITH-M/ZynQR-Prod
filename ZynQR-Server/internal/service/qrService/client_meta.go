package qrservice

import (
	"fmt"
	"net"
	"net/http"
	"strings"
)

// ClientMeta is everything we know about the requester from headers/connection.
// All fields are best-effort and may be empty.
type ClientMeta struct {
	IP      string // public client IP (no port, no chain)
	City    string // populated only when the platform forwards a geo header (e.g. Vercel)
	Country string // ISO country code or full name depending on platform
}

// ipHeaderPriority is the order in which we look for the *client* IP. The first
// non-empty, non-private value wins. This deliberately does not rely on Gin's
// c.ClientIP() because TrustedPlatform returns the raw header value (which can
// be the comma-separated chain "client, proxy1, proxy2" on Vercel) and falling
// back to TrustedProxies is brittle on serverless where the proxy CIDR is not
// known.
var ipHeaderPriority = []string{
	"X-Vercel-Forwarded-For", // Vercel: rewritten chain (left-most = real client)
	"X-Real-IP",              // Vercel + many reverse proxies: pre-parsed client IP
	"CF-Connecting-IP",       // Cloudflare
	"True-Client-IP",         // Akamai / Cloudflare Enterprise
	"Fly-Client-IP",          // Fly.io
	"X-Forwarded-For",        // Generic standard (left-most entry)
}

// ExtractClientMeta inspects the incoming HTTP request and returns the best
// guess at the real client IP plus any platform-provided geo metadata.
//
// On Vercel this is essentially free and 100% accurate because Vercel sets
//
//	x-real-ip                — parsed client IP
//	x-vercel-ip-city         — approximate city
//	x-vercel-ip-country      — ISO country code
//
// on every request. We use those when present so analytics works even when
// ipapi.co is rate-limited or down.
//
// On other platforms (Render, Fly.io, plain VPS behind nginx, …) we fall
// through to RemoteAddr; ip_geo.go then resolves city/country itself.
func ExtractClientMeta(r *http.Request) ClientMeta {
	meta := ClientMeta{
		City:    strings.TrimSpace(r.Header.Get("X-Vercel-IP-City")),
		Country: strings.TrimSpace(r.Header.Get("X-Vercel-IP-Country")),
	}

	for _, h := range ipHeaderPriority {
		raw := strings.TrimSpace(r.Header.Get(h))
		if raw == "" {
			continue
		}
		// X-Forwarded-For is a comma-separated chain "client, proxy1, ...".
		// The left-most entry is what we want.
		if comma := strings.IndexByte(raw, ','); comma >= 0 {
			raw = strings.TrimSpace(raw[:comma])
		}
		raw = stripPort(raw)
		if ip := net.ParseIP(raw); ip != nil && !ip.IsLoopback() && !ip.IsUnspecified() && !ip.IsPrivate() {
			meta.IP = ip.String()
			break
		}
	}

	if meta.IP == "" {
		// Last-resort: the TCP peer. On Vercel this is an internal LB IP and
		// will be skipped by ip_geo, but we still want it persisted so support
		// can correlate scans by connection.
		if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
			meta.IP = host
		} else {
			meta.IP = r.RemoteAddr
		}
	}

	// Helpful debug line on every scan. If headers are not what we expect this
	// is the single fastest way to see what Vercel/Render is actually sending.
	fmt.Printf(
		"[client_meta] resolved ip=%q city=%q country=%q | xff=%q xrealip=%q xvercel=%q xvercel_city=%q xvercel_country=%q remote=%q\n",
		meta.IP, meta.City, meta.Country,
		r.Header.Get("X-Forwarded-For"),
		r.Header.Get("X-Real-IP"),
		r.Header.Get("X-Vercel-Forwarded-For"),
		r.Header.Get("X-Vercel-IP-City"),
		r.Header.Get("X-Vercel-IP-Country"),
		r.RemoteAddr,
	)
	return meta
}

// stripPort removes a trailing ":port" or "[v6]:port" suffix if present.
func stripPort(s string) string {
	if host, _, err := net.SplitHostPort(s); err == nil {
		return host
	}
	return s
}
