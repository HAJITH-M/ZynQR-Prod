package authservice

import (
	autherrors "ZynQR-Server/internal/errors"
	authmodel "ZynQR-Server/internal/model/AuthModel"
	"ZynQR-Server/internal/repository"
	"ZynQR-Server/pkg/utils"
	"time"

	"github.com/google/uuid"
)

func ChangePasswordService(input ChangePasswordInput) error {
	userEmail := input.Email
	userOldPass := input.OldPassword
	userNewPass := input.NewPassword
	userNewPassHash, err := utils.GeneratePasswordWithHash(userNewPass)

	if err != nil {
		return err
	}

	storedPass, err := repository.GetUserPasswordRepo(userEmail)
	if err != nil {
		return err
	}

	passMatch := utils.CompareHashedPassword(storedPass, userOldPass)
	if passMatch != nil {
		return autherrors.ErrOldPasswordDoesntMatch
	}
	newPassMatch := utils.CompareHashedPassword(storedPass, userNewPass)
	if newPassMatch == nil {
		return autherrors.ErrNewPasswordShouldDifferFromOld
	}

	if err := repository.ChangePasswordRepo(userEmail, userNewPassHash); err != nil {
		return autherrors.ErrFailedToUpdatePasswordChange
	}

	return nil
}

func ForgotPasswordUpdateService(email, newPassword string) error {
	user, err := repository.GetUserByEmailRepo(email)
	if err != nil {
		return autherrors.ErrFailedToGetPassword
	}
	if user == nil {
		return autherrors.ErrUserNotFound
	}

	hashPassword, err := utils.GeneratePasswordWithHash(newPassword)
	if err != nil {
		return err
	}

	// Look up existing password method (may be nil for Google-only accounts).
	existing, err := repository.GetAuthenticationMethodByUserAndProviderRepo(user.ID, "password")
	if err != nil {
		return autherrors.ErrFailedToGetPassword
	}

	if existing == nil {
		// Google-only account setting a password for the first time — attach a password method
		// so the user can sign in with either Google OR email/password from now on.
		now := time.Now()
		newMethod := &authmodel.AuthenticationMethod{
			ID:                    uuid.NewString(),
			UserID:                user.ID,
			ProviderType:          "password",
			PasswordHash:          hashPassword,
			PasswordLastChangedAt: &now,
			IsPrimary:             false,
			CreatedAt:             now,
			UpdatedAt:             now,
		}
		if err := repository.CreateAuthenticationMethodRepo(newMethod); err != nil {
			return autherrors.ErrFailedToUpdatePassword
		}
	} else {
		if utils.CompareHashedPassword(existing.PasswordHash, newPassword) == nil {
			return autherrors.ErrNewPasswordSameAsCurrent
		}
		if err := repository.ChangePasswordRepo(email, hashPassword); err != nil {
			return autherrors.ErrFailedToUpdatePassword
		}
	}

	if err := repository.UpdateUserAccountStatusRepo(email, "active"); err != nil {
		return autherrors.ErrFailedToUpdateStatus
	}

	return nil
}
