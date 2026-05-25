package authservice

import (
	autherrors "ZynQR-Server/internal/errors"
	authmodel "ZynQR-Server/internal/model/AuthModel"
	"ZynQR-Server/internal/repository"
	"ZynQR-Server/pkg/mailer"
	"ZynQR-Server/pkg/utils"
	"log"
	"time"

	"github.com/google/uuid"
)

func RegisterService(input RegisterInput) (*RegisterResult, error) {

	if utils.ValidEmailPattern(input.Email) == false {
		return nil, autherrors.ErrInvalidEmailFormat
	}

	if utils.PasswordValidPattern(input.Password) == false {
		return nil, autherrors.ErrInvalidPasswordFormat
	}

	existing, err := repository.GetUserByEmailRepo(input.Email)

	if err != nil {
		return nil, err
	}

	if existing != nil {
		return nil, autherrors.ErrEmailAlreadyExists
	}

	hashPassword, err := utils.GeneratePasswordWithHash(input.Password)
	if err != nil {
		return nil, autherrors.ErrFailedToProcessPassword
	}

	userID := uuid.NewString()
	now := time.Now()

	user := &authmodel.User{
		ID:            userID,
		Email:         input.Email,
		DisplayName:   input.DisplayName,
		EmailVerified: false,
		AccountStatus: "active",
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	method := &authmodel.AuthenticationMethod{
		ID:           uuid.NewString(),
		UserID:       userID,
		ProviderType: "password",
		PasswordHash: string(hashPassword),
		IsPrimary:    true,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := repository.CreateUserWithAuthRepo(user, method); err != nil {
		return nil, autherrors.ErrFailedToCreateAccount
	}

	rawToken, err := utils.GenerateSecureToken(userID)
	if err != nil {
		_ = repository.DeleteUserCascadeRepo(userID)
		return nil, autherrors.ErrFailedToGenerateVerificationToken
	}

	rawTokenHash := utils.HashSecureToken(rawToken)
	tokenID := uuid.NewString()

	userToken := &authmodel.UserToken{
		TokenID:   tokenID,
		UserID:    userID,
		TokenHash: rawTokenHash,
		TokenType: "email_verification",
		ExpiresAt: time.Now().Add(10 * time.Minute),
		IsUsed:    false,
		CreatedAt: now,
	}

	if err := repository.UserTokenCreationRepo(userToken); err != nil {
		_ = repository.DeleteUserCascadeRepo(userID)
		return nil, autherrors.ErrFailedToSaveToken
	}

	if err := mailer.SendEmailVerificationEmail(user.Email, user.DisplayName, rawToken); err != nil {
		log.Printf("[register] verification email to %s failed: %v — rolling back account", user.Email, err)
		if cleanupErr := repository.DeleteUserCascadeRepo(userID); cleanupErr != nil {
			log.Printf("[register] rollback for user %s failed: %v", userID, cleanupErr)
		}
		return nil, autherrors.ErrFailedToSendVerificationEmail
	}

	return &RegisterResult{
		Email:       user.Email,
		DisplayName: user.DisplayName,
		UserId:      user.ID,
	}, nil
}
