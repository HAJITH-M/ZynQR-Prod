package utils

import (
	"unicode"
)

func PasswordValidPattern(pass string) bool {
	if len(pass) < 8 {
		return false
	}

	hasUpper, hasLower, hasNumber, hasSpecial := false, false, false, false

	for _, char := range pass {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsNumber(char):
			hasNumber = true
		case unicode.IsPunct(char), unicode.IsSymbol(char):
			hasSpecial = true
		}
	}

	return hasUpper && hasLower && hasNumber && hasSpecial
}
