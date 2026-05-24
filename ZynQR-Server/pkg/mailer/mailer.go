package mailer

import (
	mailconfig "ZynQR-Server/internal/config/mailConfig"
	"crypto/tls"
	"fmt"
	"net"
	"net/smtp"
	"strings"
	"time"
)

func SendEmailVerificationEmail(toEmail, displayName, token string) error {
	cfg := mailconfig.LoadSMTPConfig()
	brand := loadEmailBrand(cfg.BaseURL)
	link := fmt.Sprintf("%s/api/v1/auth/verification-email?token=%s", cfg.BaseURL, token)
	subject := fmt.Sprintf("Verify your %s email", brand.AppName)
	body := buildEmailVerificationHTML(brand, displayName, link)
	return sendHTMLEmail(cfg, toEmail, subject, body)
}

func SendOtpEmail(toEmail, otp string) error {
	cfg := mailconfig.LoadSMTPConfig()
	brand := loadEmailBrand(cfg.BaseURL)
	subject := fmt.Sprintf("%s password reset code", brand.AppName)
	body := buildPasswordResetOTPHTML(brand, otp)
	return sendHTMLEmail(cfg, toEmail, subject, body)
}

// SendLogin2FAOtpEmail emails a one-time code used after password verification when 2FA is enabled.
func SendLogin2FAOtpEmail(toEmail, otp string) error {
	cfg := mailconfig.LoadSMTPConfig()
	brand := loadEmailBrand(cfg.BaseURL)
	subject := fmt.Sprintf("%s sign-in code", brand.AppName)
	body := buildLogin2FAOTPHTML(brand, otp)
	return sendHTMLEmail(cfg, toEmail, subject, body)
}

func sendHTMLEmail(cfg mailconfig.SmtpConfig, to, subject, htmlBody string) error {
	if cfg.Host == "" || cfg.From == "" {
		return fmt.Errorf("smtp not configured")
	}
	subjectLine := fmt.Sprintf("Subject: %s\r\n", subject)
	mime := "MIME-version: 1.0;\r\nContent-Type: text/html; charset=\"UTF-8\";\r\n\r\n"
	msg := []byte(subjectLine + mime + htmlBody)
	return sendMailWithTimeout(cfg, to, msg, 20*time.Second)
}

// SendContactInquiryEmail delivers a contact-form message to the support inbox (Reply-To set to the sender).
func SendContactInquiryEmail(inbox, senderName, senderEmail, topicLabel, message string) error {
	cfg := mailconfig.LoadSMTPConfig()
	if cfg.Host == "" || cfg.From == "" {
		return fmt.Errorf("smtp not configured")
	}

	brand := loadEmailBrand(cfg.BaseURL)
	plainTopic := strings.TrimSpace(topicLabel)
	subject := fmt.Sprintf("Subject: [%s Contact] %s\r\n", brand.AppName, plainTopic)
	replyTo := fmt.Sprintf("Reply-To: %s\r\n", strings.TrimSpace(senderEmail))
	mime := "MIME-version: 1.0;\r\nContent-Type: text/html; charset=\"UTF-8\";\r\n\r\n"

	body := buildContactInquiryHTML(brand, senderName, senderEmail, topicLabel, message)
	msg := []byte(replyTo + subject + mime + body)

	return sendMailWithTimeout(cfg, inbox, msg, 20*time.Second)
}

func sendMailWithTimeout(cfg mailconfig.SmtpConfig, to string, msg []byte, dialTimeout time.Duration) error {
	addr := net.JoinHostPort(cfg.Host, cfg.Port)
	tlsConfig := &tls.Config{ServerName: cfg.Host}

	var conn net.Conn
	var err error
	dialer := &net.Dialer{Timeout: dialTimeout}

	if cfg.Port == "465" {
		conn, err = tls.DialWithDialer(dialer, "tcp", addr, tlsConfig)
	} else {
		conn, err = dialer.Dial("tcp", addr)
	}
	if err != nil {
		return fmt.Errorf("smtp dial: %w", err)
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, cfg.Host)
	if err != nil {
		return fmt.Errorf("smtp client: %w", err)
	}
	defer client.Close()

	// Gmail and most providers on 587 require STARTTLS before AUTH.
	if cfg.Port != "465" {
		if ok, _ := client.Extension("STARTTLS"); ok {
			if err := client.StartTLS(tlsConfig); err != nil {
				return fmt.Errorf("smtp starttls: %w", err)
			}
		}
	}

	if cfg.Password != "" {
		auth := smtp.PlainAuth("", cfg.From, cfg.Password, cfg.Host)
		if err := client.Auth(auth); err != nil {
			return fmt.Errorf("smtp auth: %w", err)
		}
	}

	if err := client.Mail(cfg.From); err != nil {
		return fmt.Errorf("smtp mail from: %w", err)
	}
	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("smtp rcpt: %w", err)
	}

	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("smtp data: %w", err)
	}
	if _, err := w.Write(msg); err != nil {
		return fmt.Errorf("smtp write: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("smtp close data: %w", err)
	}
	return client.Quit()
}
