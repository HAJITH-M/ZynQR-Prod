package contactservice

import (
	"ZynQR-Server/internal/config/env"
	"ZynQR-Server/pkg/mailer"
	"errors"
	"fmt"
	"strings"
)

var (
	ErrContactNotConfigured = errors.New("contact inbox is not configured")
	ErrInvalidTopic         = errors.New("invalid contact topic")
)

var topicLabels = map[string]string{
	"general":  "General question",
	"account":  "Account & sign-in",
	"billing":  "Pricing & plans",
	"api":      "API & integrations",
	"security": "Security & privacy",
	"bug":      "Bug or technical issue",
}

type ContactInput struct {
	Name    string
	Email   string
	Topic   string
	Message string
}

func resolveInbox() (string, error) {
	inbox := strings.TrimSpace(env.AppEnv.CONTACT_INBOX_EMAIL)
	if inbox == "" {
		inbox = strings.TrimSpace(env.AppEnv.SMTP_FROM)
	}
	if inbox == "" {
		return "", ErrContactNotConfigured
	}
	return inbox, nil
}

func topicLabel(topic string) (string, error) {
	key := strings.TrimSpace(strings.ToLower(topic))
	label, ok := topicLabels[key]
	if !ok {
		return "", ErrInvalidTopic
	}
	return label, nil
}

// SubmitContactService emails the support inbox with the visitor's message.
func SubmitContactService(input ContactInput) error {
	inbox, err := resolveInbox()
	if err != nil {
		return err
	}

	label, err := topicLabel(input.Topic)
	if err != nil {
		return err
	}

	if err := mailer.SendContactInquiryEmail(
		inbox,
		input.Name,
		input.Email,
		label,
		input.Message,
	); err != nil {
		return fmt.Errorf("send contact email: %w", err)
	}

	return nil
}
