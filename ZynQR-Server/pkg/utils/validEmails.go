package utils

import (
	"strings"
)

func ValidEmailPattern(email string) bool {

	domains := []string{
		"gmail.com",
		"outlook.com",
		"yahoo.com",
	}

	for _, domain := range domains {
		if strings.HasSuffix(email, domain) {
			return true
		}
	}

	return false
}
