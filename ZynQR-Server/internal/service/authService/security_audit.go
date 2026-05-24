package authservice

import (
	authmodel "ZynQR-Server/internal/model/AuthModel"
	"ZynQR-Server/internal/repository"
	"time"

	"github.com/google/uuid"
)

const (
	AuditEventLogin          = "login"
	AuditEventLoginFailed    = "login_failed"
	AuditEventOAuthLogin     = "oauth_login"
	AuditEventLogout         = "logout"
	AuditEventLogoutAll      = "logout_all"
	AuditEventPasswordChange = "password_change"
	AuditEventPasswordReset  = "password_reset"
	AuditEventSessionRevoke  = "session_revoke"
)

const (
	AuditStatusSuccess = "success"
	AuditStatusFailed  = "failed"
)

// RecordSecurityAudit persists one audit row (best-effort; errors are ignored).
func RecordSecurityAudit(userID *string, eventType, status, ip, userAgent string) {
	ua := userAgent
	if len(ua) > 500 {
		ua = ua[:500]
	}
	row := &authmodel.SecurityAuditLog{
		ID:        uuid.NewString(),
		UserID:    userID,
		EventType: eventType,
		Status:    status,
		IPAddress: ip,
		UserAgent: ua,
		CreatedAt: time.Now(),
	}
	_ = repository.CreateSecurityAuditLogRepo(row)
}
