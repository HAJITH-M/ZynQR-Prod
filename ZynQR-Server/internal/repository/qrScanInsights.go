package repository

import "ZynQR-Server/pkg/database"

const scanInsightsSampleLimit = 100

// ListRecentScanUserAgentsRepo returns user-agent strings from the latest scans (newest first).
func ListRecentScanUserAgentsRepo(userID string, limit int) ([]string, error) {
	if limit < 1 {
		limit = scanInsightsSampleLimit
	}
	if limit > scanInsightsSampleLimit {
		limit = scanInsightsSampleLimit
	}
	// COALESCE: older rows may have NULL user_agent; Go string cannot scan SQL NULL.
	var agents []string
	err := database.DB.Raw(`
		SELECT COALESCE(user_agent, '') AS user_agent
		FROM qr_scans
		WHERE user_id = ?
		ORDER BY created_at DESC
		LIMIT ?
	`, userID, limit).Scan(&agents).Error
	if err != nil {
		return nil, err
	}
	return agents, nil
}
