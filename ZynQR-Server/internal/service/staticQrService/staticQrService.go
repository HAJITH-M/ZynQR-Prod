package staticqrservice

import (
	"encoding/base64"
	"errors"
	"strings"
	"time"

	"ZynQR-Server/internal/model/staticqr"
	"ZynQR-Server/internal/repository"

	"github.com/google/uuid"
	"github.com/skip2/go-qrcode"
)

const maxPayloadLen = 2048

func Create(userID, name, encodedPayload string) (*staticqr.StaticQr, error) {
	name = strings.TrimSpace(name)
	encodedPayload = strings.TrimSpace(encodedPayload)
	if name == "" {
		return nil, errors.New("name is required")
	}
	if encodedPayload == "" {
		return nil, errors.New("encoded_payload is required")
	}
	if len(encodedPayload) > maxPayloadLen {
		return nil, errors.New("encoded_payload too long")
	}

	png, err := qrcode.Encode(encodedPayload, qrcode.Medium, 256)
	if err != nil {
		return nil, err
	}
	dataURL := "data:image/png;base64," + base64.StdEncoding.EncodeToString(png)

	row := &staticqr.StaticQr{
		ID:             uuid.New().String(),
		UserID:         userID,
		Name:           name,
		EncodedPayload: encodedPayload,
		ImageDataURL:   dataURL,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	if err := repository.CreateStaticQrRepo(row); err != nil {
		return nil, err
	}
	return row, nil
}

func List(userID string) ([]staticqr.StaticQr, error) {
	return repository.ListStaticQrByUserRepo(userID)
}

func Delete(userID, id string) error {
	return repository.DeleteStaticQrForUserRepo(id, userID)
}
