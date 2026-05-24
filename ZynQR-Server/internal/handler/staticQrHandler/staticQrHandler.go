package staticqrhandler

import (
	"errors"
	"net/http"

	staticqrservice "ZynQR-Server/internal/service/staticQrService"
	"ZynQR-Server/pkg/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type createStaticQrBody struct {
	Name           string `json:"name" binding:"required"`
	EncodedPayload string `json:"encoded_payload" binding:"required"`
}

func CreateStaticQrHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	var body createStaticQrBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationErrors(err)})
		return
	}
	row, err := staticqrservice.Create(userID, body.Name, body.EncodedPayload)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"id":              row.ID,
		"name":            row.Name,
		"encoded_payload": row.EncodedPayload,
		"image_data_url":  row.ImageDataURL,
	})
}

func ListStaticQrHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	rows, err := staticqrservice.List(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "list failed"})
		return
	}
	items := make([]gin.H, 0, len(rows))
	for _, r := range rows {
		items = append(items, gin.H{
			"id":              r.ID,
			"name":            r.Name,
			"encoded_payload": r.EncodedPayload,
			"image_data_url":  r.ImageDataURL,
			"created_at":      r.CreatedAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

func DeleteStaticQrHandler(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id required"})
		return
	}
	err := staticqrservice.Delete(userID, id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
