package qrservice

import (
	"ZynQR-Server/internal/config/env"
	qrmodel "ZynQR-Server/internal/model/QrModel"
	"ZynQR-Server/internal/repository"
	"encoding/base64"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/skip2/go-qrcode"
)

type QrResult struct {
	ID             string
	QrName         string
	ScanURL        string
	DestinationURL string
	Status         string
	ScanCount      int64
}

// PublicScanBaseURL is the origin used to build /qr/<id> links (PUBLIC_SCAN_URL in .env).
func PublicScanBaseURL() string {
	return strings.TrimSuffix(strings.TrimSpace(env.AppEnv.PUBLIC_SCAN_URL), "/")
}

func CreateQrService(email, destURL, qrName string, analyticsEnabled bool) (*QrResult, error) {
	existing, err := repository.GetUserByEmailRepo(email)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, errors.New("user not found")
	}

	id := uuid.New().String()
	scanURL := PublicScanBaseURL() + "/qr/" + id

	png, err := qrcode.Encode(scanURL, qrcode.Medium, 256)
	if err != nil {
		return nil, err
	}
	qrImageDataURL := "data:image/png;base64," + base64.StdEncoding.EncodeToString(png)

	qr := &qrmodel.QrDetails{
		ID:               id,
		UserID:           existing.ID,
		QrName:           qrName,
		DestinationURL:   destURL,
		Status:           "active",
		AnalyticsEnabled: analyticsEnabled,
		QrImageURL:       qrImageDataURL,
		CreatedAt:        time.Now(),
	}
	if err := repository.CreateQrRepository(qr); err != nil {
		return nil, err
	}

	LogQrCreated(existing.ID, id, qrName)

	return &QrResult{
		ID:             id,
		QrName:         qrName,
		ScanURL:        scanURL,
		DestinationURL: destURL,
		Status:         "active",
		ScanCount:      0,
	}, nil
}
