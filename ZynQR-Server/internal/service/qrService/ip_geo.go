package qrservice

import (
	"ZynQR-Server/internal/config/env"
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"
)

var ipGeoHTTPClient = &http.Client{Timeout: 2 * time.Second}

func ipGeoSkipReason(ip net.IP) string {
	if ip == nil {
		return "unparseable IP"
	}
	if ip.IsUnspecified() {
		return "unspecified IP"
	}
	if ip.IsLoopback() {
		return "loopback (localhost — use a public URL / reverse proxy so ClientIP is a real address for city/country)"
	}
	if ip.IsPrivate() {
		return "private LAN IP (no public geolocation)"
	}
	return ""
}

// LookupApproxPlaceFromIP returns approximate city and country for a public IPv4 address.
// Uses ipapi.co free tier (rate-limited). Private, loopback, unspecified, and non-IPv4
// addresses return empty strings so redirects stay fast and predictable.
func LookupApproxPlaceFromIP(ctx context.Context, ipStr string) (city, country string) {
	raw := strings.TrimSpace(ipStr)
	ip := net.ParseIP(raw)
	if ip == nil || ip.IsLoopback() || ip.IsPrivate() || ip.IsUnspecified() {
		reason := ipGeoSkipReason(ip)
		if reason == "" {
			reason = "skipped"
		}
		fmt.Printf("[ip_geo] skip %q: %s\n", raw, reason)
		return "", ""
	}
	if ip.To4() == nil {
		fmt.Printf("[ip_geo] skip %s: non-IPv4 (geocoder path is IPv4-only for now)\n", ip.String())
		return "", ""
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, ipGeoLookupURL(ip.String()), nil)
	if err != nil {
		return "", ""
	}

	res, err := ipGeoHTTPClient.Do(req)
	if err != nil {
		return "", ""
	}
	defer res.Body.Close()

	var payload struct {
		City        string `json:"city"`
		CountryName string `json:"country_name"`
		Error       bool   `json:"error"`
	}
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		fmt.Printf("[ip_geo] decode error for %s: %v\n", ip.String(), err)
		return "", ""
	}
	if payload.Error {
		fmt.Printf("[ip_geo] api error flag for %s\n", ip.String())
		return "", ""
	}
	city = strings.TrimSpace(payload.City)
	country = strings.TrimSpace(payload.CountryName)
	fmt.Printf("[ip_geo] %s -> city=%q country=%q\n", ip.String(), city, country)
	return city, country
}

func ipGeoLookupURL(ip string) string {
	base := strings.TrimSuffix(strings.TrimSpace(env.AppEnv.IP_GEO_API_BASE_URL), "/")
	return base + "/" + ip + "/json/"
}
