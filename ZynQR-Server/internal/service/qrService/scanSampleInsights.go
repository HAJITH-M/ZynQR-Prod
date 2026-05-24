package qrservice

import (
	"strings"

	"github.com/mileusna/useragent"
)

// DeviceSharePct is mobile / desktop / tablet percentages (sum 100 when sample > 0).
type DeviceSharePct struct {
	MobilePct  int `json:"mobile_pct"`
	DesktopPct int `json:"desktop_pct"`
	TabletPct  int `json:"tablet_pct"`
}

// BrowserSharePct is one browser bucket with share of the scan sample.
type BrowserSharePct struct {
	Label string `json:"label"`
	Pct   int    `json:"pct"`
}

// ScanSampleInsights aggregates device and browser breakdown from recent scan user-agents.
type ScanSampleInsights struct {
	SampleSize   int               `json:"sample_size"`
	HasUserAgent bool              `json:"has_user_agent"`
	DeviceShare  DeviceSharePct    `json:"device_share"`
	TopBrowsers  []BrowserSharePct `json:"top_browsers"`
}

func normalizeThreeWay(m, d, t int) (int, int, int) {
	total := m + d + t
	if total == 0 {
		return 0, 0, 0
	}
	mp := int(float64(m)/float64(total)*100 + 0.5)
	dp := int(float64(d)/float64(total)*100 + 0.5)
	tp := int(float64(t)/float64(total)*100 + 0.5)
	diff := 100 - (mp + dp + tp)
	if diff != 0 {
		max := m
		which := 0
		if d > max {
			max = d
			which = 1
		}
		if t > max {
			which = 2
		}
		switch which {
		case 0:
			mp += diff
		case 1:
			dp += diff
		default:
			tp += diff
		}
	}
	return mp, dp, tp
}

func normalizeFourWay(safari, chrome, edge, other int) (int, int, int, int) {
	total := safari + chrome + edge + other
	if total == 0 {
		return 0, 0, 0, 0
	}
	round := func(x int) int {
		return int(float64(x)/float64(total)*100 + 0.5)
	}
	sp, cp, ep, op := round(safari), round(chrome), round(edge), round(other)
	diff := 100 - (sp + cp + ep + op)
	if diff != 0 {
		max := safari
		which := 0
		if chrome > max {
			max = chrome
			which = 1
		}
		if edge > max {
			max = edge
			which = 2
		}
		if other > max {
			which = 3
		}
		switch which {
		case 0:
			sp += diff
		case 1:
			cp += diff
		case 2:
			ep += diff
		default:
			op += diff
		}
	}
	return sp, cp, ep, op
}

func bucketBrowser(rawName string) string {
	n := strings.ToLower(strings.TrimSpace(rawName))
	if n == "" {
		return "other"
	}
	if strings.Contains(n, "edg") {
		return "edge"
	}
	if strings.Contains(n, "crios") || (strings.Contains(n, "chrome") && !strings.Contains(n, "edg")) {
		return "chrome"
	}
	if strings.Contains(n, "safari") {
		return "safari"
	}
	return "other"
}

// BuildScanSampleInsights parses user-agent strings (same rules as the React dashboard).
func BuildScanSampleInsights(userAgents []string) ScanSampleInsights {
	n := len(userAgents)
	out := ScanSampleInsights{
		SampleSize: n,
		TopBrowsers: []BrowserSharePct{
			{Label: "Safari", Pct: 0},
			{Label: "Chrome", Pct: 0},
			{Label: "Edge", Pct: 0},
			{Label: "Other", Pct: 0},
		},
	}
	if n == 0 {
		return out
	}

	var mobile, desktop, tablet int
	var uaHits int
	var safari, chrome, edge, other int

	for _, raw := range userAgents {
		ua := strings.TrimSpace(raw)
		if ua == "" {
			desktop++
			other++
			continue
		}
		uaHits++
		parsed := useragent.Parse(ua)
		if parsed.Mobile {
			mobile++
		} else if parsed.Tablet {
			tablet++
		} else {
			desktop++
		}
		switch bucketBrowser(parsed.Name) {
		case "safari":
			safari++
		case "chrome":
			chrome++
		case "edge":
			edge++
		default:
			other++
		}
	}

	mp, dp, tp := normalizeThreeWay(mobile, desktop, tablet)
	sp, cp, ep, op := normalizeFourWay(safari, chrome, edge, other)

	out.HasUserAgent = uaHits > 0
	out.DeviceShare = DeviceSharePct{MobilePct: mp, DesktopPct: dp, TabletPct: tp}
	out.TopBrowsers = []BrowserSharePct{
		{Label: "Safari", Pct: sp},
		{Label: "Chrome", Pct: cp},
		{Label: "Edge", Pct: ep},
		{Label: "Other", Pct: op},
	}
	return out
}
