package authhandler

import (
	"net/http"
	"strings"

	"ZynQR-Server/internal/repository"

	"github.com/gin-gonic/gin"
)

type deleteAccountBody struct {
	Confirmation string `json:"confirmation"`
}

// DeleteAccountHandler permanently deletes the authenticated user and all related data. Body: { "confirmation": "delete" }.
func DeleteAccountHandler(c *gin.Context) {
	uidVal, ok := c.Get("user_id")
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID, _ := uidVal.(string)
	if userID == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var body deleteAccountBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	confirm := strings.TrimSpace(strings.ToLower(body.Confirmation))
	if confirm != "delete" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "type delete to confirm account removal"})
		return
	}

	if err := repository.DeleteUserAccountAndAllDataRepo(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete account"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "account deleted",
	})
}
