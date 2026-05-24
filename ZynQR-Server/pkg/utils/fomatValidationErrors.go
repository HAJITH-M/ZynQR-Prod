package utils

import "github.com/go-playground/validator/v10"

func FormatValidationErrors(err error) map[string]string {
	errors := make(map[string]string)

	if ve, ok := err.(validator.ValidationErrors); ok {
		for _, fe := range ve {

			switch fe.Field() {

			case "Email":
				errors["email"] = "invalid email format"

			case "Password":
				errors["password"] = "password must be at least 8 characters"

			case "DisplayName":
				errors["display_name"] = "display name is required"
			case "QrName":
				errors["qr_name"] = "qr name is required"
			case "DestinationURL":
				errors["destination_url"] = "destination url is required"
			case "Status":
				errors["status"] = "status is required"
			case "Name":
				errors["name"] = "name must be at least 2 characters"
			case "Message":
				errors["message"] = "message must be at least 10 characters"
			case "Topic":
				errors["topic"] = "please choose a topic"
			default:
				errors[fe.Field()] = fe.Error()
			}
		}
	}

	return errors
}

// FirstValidationError returns one human-readable message for API error responses.
func FirstValidationError(err error) string {
	m := FormatValidationErrors(err)
	for _, key := range []string{"name", "email", "message", "topic"} {
		if msg, ok := m[key]; ok && msg != "" {
			return msg
		}
	}
	for _, msg := range m {
		if msg != "" {
			return msg
		}
	}
	return "invalid request"
}
