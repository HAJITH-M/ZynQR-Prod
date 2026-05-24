package mailer

import (
	"html"
	"strings"

	"ZynQR-Server/internal/config/env"
)

// emailBrand holds display values for outbound emails (from env).
type emailBrand struct {
	AppName   string
	PublicURL string
}

func loadEmailBrand(publicURL string) emailBrand {
	name := strings.TrimSpace(env.AppEnv.APP_NAME)
	if name == "" {
		name = "ZynQR"
	}
	url := strings.TrimSpace(publicURL)
	if url == "" {
		url = strings.TrimSpace(env.AppEnv.PUBLIC_SCAN_URL)
	}
	return emailBrand{AppName: name, PublicURL: url}
}

func (b emailBrand) footerLine() string {
	name := html.EscapeString(strings.TrimSpace(b.AppName))
	if u := strings.TrimRight(strings.TrimSpace(b.PublicURL), "/"); u != "" {
		safeURL := html.EscapeString(u)
		return `This message was sent by <a href="` + safeURL + `" style="color:#af3100;text-decoration:none;">` + name + `</a>.`
	}
	return "This message was sent by " + name + "."
}
