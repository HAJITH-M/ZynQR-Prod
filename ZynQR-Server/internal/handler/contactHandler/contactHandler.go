package contacthandler

import (
	"errors"
	"strings"

	contactservice "ZynQR-Server/internal/service/contactService"
	"ZynQR-Server/pkg/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type contactRequest struct {
	Name    string `json:"name" binding:"required,min=2,max=120"`
	Email   string `json:"email" binding:"required,email,max=254"`
	Topic   string `json:"topic" binding:"required,max=64"`
	Message string `json:"message" binding:"required,min=10,max=5000"`
}

func SubmitContactHandler(c *gin.Context) {
	var req contactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FirstValidationError(err)})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.Topic = strings.TrimSpace(req.Topic)
	req.Message = strings.TrimSpace(req.Message)

	if len(req.Name) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name must be at least 2 characters"})
		return
	}
	if len(req.Message) < 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "message must be at least 10 characters"})
		return
	}

	err := contactservice.SubmitContactService(contactservice.ContactInput{
		Name:    req.Name,
		Email:   req.Email,
		Topic:   req.Topic,
		Message: req.Message,
	})
	if err != nil {
		if errors.Is(err, contactservice.ErrInvalidTopic) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if errors.Is(err, contactservice.ErrContactNotConfigured) {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "contact is temporarily unavailable"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not send your message. please try again later"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Thanks for reaching out. We received your message and will reply by email.",
	})
}
