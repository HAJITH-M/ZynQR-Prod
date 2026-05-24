package authservice

import (
	tokenjwt "ZynQR-Server/pkg/tokenJWT"
	"ZynQR-Server/pkg/utils"
)

func generateAccessToken(userID, email, sessionID string) (string, error) {
	return tokenjwt.GenerateAccessTokenJWT(userID, email, sessionID)
}

func generateRefreshToken(userID, email string) (string, error) {
	return tokenjwt.GenerateRefreshTokenJWT(userID, email)
}

func hashToken(raw string) string {
	return utils.HashSecureToken(raw)
}
