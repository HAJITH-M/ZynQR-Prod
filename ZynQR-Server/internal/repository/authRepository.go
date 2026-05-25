package repository

import (
	authmodel "ZynQR-Server/internal/model/AuthModel"
	"ZynQR-Server/pkg/database"
	"errors"
	"time"

	"gorm.io/gorm"
)

func GetUserByEmailRepo(email string) (*authmodel.User, error) {

	var user authmodel.User

	err := database.DB.Where("email= ?", email).First(&user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	return &user, err
}

func GetUserByIDRepo(uid string) (*authmodel.User, error) {
	var user authmodel.User
	err := database.DB.Where("id = ?", uid).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &user, nil
}

func CreateUserWithAuthRepo(user *authmodel.User, method *authmodel.AuthenticationMethod) error {

	// using transaction if one step fails also it will revert to previous steps
	err := database.DB.Transaction(func(tx *gorm.DB) error {

		if err := tx.Create(user).Error; err != nil {
			return err
		}

		if err := tx.Create(method).Error; err != nil {
			return err
		}

		return nil // commit
	})

	return err
}

// DeleteUserCascadeRepo wipes a user along with any rows tied to it
// (authentication methods, user tokens, sessions, security audit logs).
// Used to roll back a freshly-created account when a follow-up step fails —
// e.g. registration where the verification email cannot be delivered, so we
// want zero leftover rows in `users`, `authentication_methods`, `user_tokens`.
func DeleteUserCascadeRepo(userID string) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("user_id = ?", userID).Delete(&authmodel.UserToken{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", userID).Delete(&authmodel.AuthenticationMethod{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", userID).Delete(&authmodel.Session{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", userID).Delete(&authmodel.SecurityAuditLog{}).Error; err != nil {
			return err
		}
		if err := tx.Where("id = ?", userID).Delete(&authmodel.User{}).Error; err != nil {
			return err
		}
		return nil
	})
}

func GetAuthenticationMethodUserRepo(email string) (*authmodel.User, error) {

	var user authmodel.User

	err := database.DB.Preload("AuthMethods").Where("email = ?", email).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	return &user, err
}

func LastLoginUserUpdateRepo(userID string) error {
	now := time.Now()
	return database.DB.
		Model(&authmodel.User{}).
		Where("id = ?", userID).
		Update("last_login_at", now).Error
}

func CreateSessionUserRepo(session *authmodel.Session) error {
	return database.DB.Create(session).Error
}

func GetSessionByTokenHashRepo(hash string) (*authmodel.Session, error) {
	var session authmodel.Session

	err := database.DB.
		Where("refresh_token_hash = ? AND is_revoked = false and expires_at > NOW()", hash).
		First(&session).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &session, err
}

func GetActiveSessionByIDRepo(sessionID string) (*authmodel.Session, error) {
	var session authmodel.Session

	err := database.DB.
		Where("session_id = ? AND is_revoked = false and expires_at > NOW()", sessionID).
		First(&session).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &session, err
}

func RevokeSessionRepo(sessionID string) error {
	return database.DB.
		Model(&authmodel.Session{}).
		Where("session_id = ?", sessionID).
		Update("is_revoked", true).Error
}

func RevokeAllSessionsByUserIDRepo(userID string) error {
	return database.DB.
		Model(&authmodel.Session{}).
		Where("user_id = ? AND is_revoked = false", userID).
		Update("is_revoked", true).Error
}

func UserTokenCreationRepo(userToken *authmodel.UserToken) error {
	return database.DB.Create(userToken).Error
}

func GetUserTokenRepo(hashedToken, tokenType string) (*authmodel.UserToken, error) {
	var userToken authmodel.UserToken
	err := database.DB.
		Where("token_hash = ? AND token_type = ? AND is_used = false AND expires_at > NOW()", hashedToken, tokenType).
		First(&userToken).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &userToken, nil
}

func UpdateVerificationUserTokenStatusRepo(userID, tokenId string) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&authmodel.UserToken{}).Where("token_id = ?", tokenId).Update("is_used", true).Error; err != nil {
			return errors.New("failed to mark token as used")
		}

		if err := tx.Model(&authmodel.User{}).Where("id = ?", userID).Update("email_verified", true).Error; err != nil {
			return errors.New("failed to verify user email")
		}
		return nil
	})
}

func GetUserPasswordRepo(email string) (string, error) {

	var authMethod authmodel.AuthenticationMethod

	err := database.DB.
		Joins("JOIN users ON users.id = authentication_methods.user_id").
		Where("users.email = ?", email).
		Select("authentication_methods.password_hash").
		First(&authMethod).Error

	if err != nil {
		return "", err
	}

	return authMethod.PasswordHash, nil
}

func ChangePasswordRepo(email, newPassword string) error {
	// 1. Find the user by email
	var user authmodel.User
	if err := database.DB.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user not found")
		}
		return err
	}

	// 2. Update password for this user's password auth method
	return database.DB.
		Model(&authmodel.AuthenticationMethod{}).
		Where("user_id = ? AND provider_type = ?", user.ID, "password").
		Update("password_hash", newPassword).Error
}

// UpdateUserTwoFactorEnabledRepo sets whether password login requires an email OTP.
func UpdateUserTwoFactorEnabledRepo(userID string, enabled bool) error {
	return database.DB.
		Model(&authmodel.User{}).
		Where("id = ?", userID).
		Update("two_factor_enabled", enabled).Error
}

// UpdateUserDisplayNameRepo updates the user's display name (trimmed by caller).
func UpdateUserDisplayNameRepo(userID, displayName string) error {
	return database.DB.
		Model(&authmodel.User{}).
		Where("id = ?", userID).
		Update("display_name", displayName).Error
}

func UpdateUserAccountStatusRepo(email, status string) error {
	// 1. Find the user by email
	var user authmodel.User
	if err := database.DB.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user not found")
		}
		return err
	}
	return database.DB.
		Model(&authmodel.User{}).
		Where("id = ?", user.ID).
		Update("account_status", status).Error
}

// GetAuthenticationMethodByProviderRepo fetches an authentication method using the provider identity.
func GetAuthenticationMethodByProviderRepo(providerType, providerUserID string) (*authmodel.AuthenticationMethod, error) {
	var method authmodel.AuthenticationMethod
	err := database.DB.
		Where("provider_type = ? AND provider_user_id = ?", providerType, providerUserID).
		First(&method).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &method, err
}

func CreateAuthenticationMethodRepo(method *authmodel.AuthenticationMethod) error {
	return database.DB.Create(method).Error
}

// UpdateAuthenticationMethodOauthTokensByMethodIDRepo updates stored Google OAuth refresh token + expiry.
// If oauthRefreshToken is empty, it will not overwrite the existing refresh token.
func UpdateAuthenticationMethodOauthTokensByMethodIDRepo(methodID string, oauthRefreshToken string, oauthTokenExpiry *time.Time) error {
	updates := map[string]interface{}{}

	if oauthRefreshToken != "" {
		updates["oauth_refresh_token"] = oauthRefreshToken
	}
	if oauthTokenExpiry != nil {
		updates["oauth_token_expiry"] = oauthTokenExpiry
	}

	if len(updates) == 0 {
		return nil
	}

	return database.DB.
		Model(&authmodel.AuthenticationMethod{}).
		Where("id = ?", methodID).
		Updates(updates).Error
}

// UpdateUserForOAuthRepo marks email as verified and refreshes the profile picture from the
// OAuth provider. The display name is only written when the user has no name yet — once set
// (by the user or by a previous OAuth sign-in), we never overwrite it on subsequent sign-ins.
func UpdateUserForOAuthRepo(userID, displayName, profilePictureURL string) error {
	updates := map[string]interface{}{
		"email_verified": true,
	}
	if profilePictureURL != "" {
		updates["profile_picture_url"] = profilePictureURL
	}

	if err := database.DB.
		Model(&authmodel.User{}).
		Where("id = ?", userID).
		Updates(updates).Error; err != nil {
		return err
	}

	// current display_name is NULL or empty, so a user who later renamed themselves
	// (or whose name was set on a previous sign-in) keeps that name forever.
	if displayName != "" {
		if err := database.DB.
			Model(&authmodel.User{}).
			Where("id = ? AND (display_name IS NULL OR display_name = '')", userID).
			Update("display_name", displayName).Error; err != nil {
			return err
		}
	}

	return nil
}

// GetAuthenticationMethodByUserAndProviderRepo finds the first auth method for a user/provider.
func GetAuthenticationMethodByUserAndProviderRepo(userID, providerType string) (*authmodel.AuthenticationMethod, error) {
	var method authmodel.AuthenticationMethod
	err := database.DB.
		Where("user_id = ? AND provider_type = ?", userID, providerType).
		First(&method).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &method, err
}

// ListActiveSessionsForUserRepo returns non-revoked sessions that are not yet expired.
func ListActiveSessionsForUserRepo(userID string) ([]authmodel.Session, error) {
	var sessions []authmodel.Session
	err := database.DB.
		Where("user_id = ? AND is_revoked = ? AND expires_at > ?", userID, false, time.Now()).
		Order("updated_at DESC").
		Find(&sessions).Error
	return sessions, err
}

// GetSessionByIDForUserRepo returns a session row if it belongs to the user (any revoked/expiry state).
func GetSessionByIDForUserRepo(sessionID, userID string) (*authmodel.Session, error) {
	var session authmodel.Session
	err := database.DB.
		Where("session_id = ? AND user_id = ?", sessionID, userID).
		First(&session).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &session, err
}

func CreateSecurityAuditLogRepo(row *authmodel.SecurityAuditLog) error {
	return database.DB.Create(row).Error
}

// ListSecurityAuditLogsForUserRepo returns newest-first audit rows for a user (only rows with user_id set).
func ListSecurityAuditLogsForUserRepo(userID string, limit int) ([]authmodel.SecurityAuditLog, error) {
	if limit <= 0 || limit > 200 {
		limit = 100
	}
	var rows []authmodel.SecurityAuditLog
	err := database.DB.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Find(&rows).Error
	return rows, err
}
