package qrservice

import (
	"ZynQR-Server/internal/repository"
	"math"
)

// AnalyticsSummary powers global analytics summary cards and scan-sample breakdowns.
type AnalyticsSummary struct {
	TotalAggregateScans int64 `json:"total_aggregate_scans"`
	TotalQrCount        int64 `json:"total_qr_count"`
	ActiveQrCount       int64 `json:"active_qr_count"`
	// ConversionRate is average scans per dynamic QR (total scans ÷ QR count).
	ConversionRate float64 `json:"conversion_rate"`
	// QrsWithScans is how many QRs have scan_count > 0 (for optional UI copy).
	QrsWithScans int64 `json:"qrs_with_scans"`
	// ScanSample is device share + top browsers from the latest scan rows (up to 100).
	ScanSample ScanSampleInsights `json:"scan_sample"`
}

func GetAnalyticsSummaryService(userID string) (*AnalyticsSummary, error) {
	agg, err := repository.QrAnalyticsSummaryRepo(userID)
	if err != nil {
		return nil, err
	}

	var conversionRate float64
	if agg.TotalQrCount > 0 {
		conversionRate = float64(agg.TotalAggregateScans) / float64(agg.TotalQrCount)
		conversionRate = math.Round(conversionRate*10) / 10
	}

	agents, err := repository.ListRecentScanUserAgentsRepo(userID, 100)
	if err != nil {
		return nil, err
	}
	scanSample := BuildScanSampleInsights(agents)

	return &AnalyticsSummary{
		TotalAggregateScans: agg.TotalAggregateScans,
		TotalQrCount:        agg.TotalQrCount,
		ActiveQrCount:       agg.ActiveQrCount,
		ConversionRate:      conversionRate,
		QrsWithScans:        agg.QrsWithScans,
		ScanSample:          scanSample,
	}, nil
}
