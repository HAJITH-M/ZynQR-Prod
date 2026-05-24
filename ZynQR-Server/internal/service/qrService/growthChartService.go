package qrservice

import (
	"errors"
	"time"

	"ZynQR-Server/internal/repository"

	"gorm.io/gorm"
)

// GrowthBucket is one bar on the System-wide Growth chart.
// BucketStart/BucketEnd are RFC3339 UTC; BucketEnd is exclusive (interval [start, end)).
type GrowthBucket struct {
	Label       string `json:"label"`
	Count       int64  `json:"count"`
	BucketStart string `json:"bucket_start,omitempty"`
	BucketEnd   string `json:"bucket_end,omitempty"`
}

func startOfDayUTC(t time.Time) time.Time {
	tt := t.In(time.UTC)
	return time.Date(tt.Year(), tt.Month(), tt.Day(), 0, 0, 0, 0, time.UTC)
}

func weekStartMondayUTC(t time.Time) time.Time {
	d := startOfDayUTC(t)
	wd := int(d.Weekday()) // Sunday=0, Monday=1
	offset := (wd + 6) % 7
	return d.AddDate(0, 0, -offset)
}

func monthStartUTC(t time.Time) time.Time {
	tt := t.In(time.UTC)
	return time.Date(tt.Year(), tt.Month(), 1, 0, 0, 0, 0, time.UTC)
}

func keyDay(t time.Time) int64 {
	return startOfDayUTC(t).Unix()
}

// GetGrowthChartService returns 7 buckets of scan counts from qr_activity_logs (event scan).
func GetGrowthChartService(userID, period string) ([]GrowthBucket, error) {
	switch period {
	case "weekly":
		return growthWeekly(userID)
	case "monthly":
		return growthMonthly(userID)
	default:
		return growthDaily(userID)
	}
}

func growthDaily(userID string) ([]GrowthBucket, error) {
	today := startOfDayUTC(time.Now().UTC())
	since := today.AddDate(0, 0, -6)
	until := today.AddDate(0, 0, 1)
	rows, err := repository.ScanGrowthByTruncRepo(userID, "day", since, until)
	if err != nil {
		return nil, err
	}
	m := map[int64]int64{}
	for _, r := range rows {
		m[keyDay(r.Bucket)] = r.Count
	}
	out := make([]GrowthBucket, 0, 7)
	for i := 0; i < 7; i++ {
		d := since.AddDate(0, 0, i)
		dEnd := d.AddDate(0, 0, 1)
		out = append(out, GrowthBucket{
			Label:       d.Format("Jan 2"),
			Count:       m[keyDay(d)],
			BucketStart: d.UTC().Format(time.RFC3339),
			BucketEnd:   dEnd.UTC().Format(time.RFC3339),
		})
	}
	return out, nil
}

func growthWeekly(userID string) ([]GrowthBucket, error) {
	today := startOfDayUTC(time.Now().UTC())
	thisWeek := weekStartMondayUTC(today)
	since := thisWeek.AddDate(0, 0, -6*7)
	until := thisWeek.AddDate(0, 0, 7)
	rows, err := repository.ScanGrowthByTruncRepo(userID, "week", since, until)
	if err != nil {
		return nil, err
	}
	m := map[int64]int64{}
	for _, r := range rows {
		ws := weekStartMondayUTC(r.Bucket)
		m[ws.Unix()] = r.Count
	}
	out := make([]GrowthBucket, 0, 7)
	for i := 0; i < 7; i++ {
		ws := thisWeek.AddDate(0, 0, -7*(6-i))
		wsEnd := ws.AddDate(0, 0, 7)
		out = append(out, GrowthBucket{
			Label:       ws.Format("Jan 2"),
			Count:       m[ws.Unix()],
			BucketStart: ws.UTC().Format(time.RFC3339),
			BucketEnd:   wsEnd.UTC().Format(time.RFC3339),
		})
	}
	return out, nil
}

func growthMonthly(userID string) ([]GrowthBucket, error) {
	today := time.Now().UTC()
	thisMonth := monthStartUTC(today)
	since := thisMonth.AddDate(0, -6, 0)
	until := thisMonth.AddDate(0, 1, 0)
	rows, err := repository.ScanGrowthByTruncRepo(userID, "month", since, until)
	if err != nil {
		return nil, err
	}
	m := map[int64]int64{}
	for _, r := range rows {
		ms := monthStartUTC(r.Bucket)
		m[ms.Unix()] = r.Count
	}
	out := make([]GrowthBucket, 0, 7)
	for i := 0; i < 7; i++ {
		ms := thisMonth.AddDate(0, -(6 - i), 0)
		msEnd := ms.AddDate(0, 1, 0)
		out = append(out, GrowthBucket{
			Label:       ms.Format("Jan 2006"),
			Count:       m[ms.Unix()],
			BucketStart: ms.UTC().Format(time.RFC3339),
			BucketEnd:   msEnd.UTC().Format(time.RFC3339),
		})
	}
	return out, nil
}

// GetQrScanFrequencyService returns one bucket per UTC day for a single QR (last N days: window 7d|30d|90d).
func GetQrScanFrequencyService(userID, qrID, window string) ([]GrowthBucket, error) {
	if _, err := repository.GetQrByUserAndIDRepo(userID, qrID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return nil, err
	}

	days := 30
	switch window {
	case "7d":
		days = 7
	case "90d":
		days = 90
	case "30d", "":
		days = 30
	default:
		days = 30
	}

	today := startOfDayUTC(time.Now().UTC())
	since := today.AddDate(0, 0, -(days - 1))
	until := today.AddDate(0, 0, 1)

	rows, err := repository.QrScanDailyCountsRepo(userID, qrID, since, until)
	if err != nil {
		return nil, err
	}
	m := map[int64]int64{}
	for _, r := range rows {
		m[keyDay(r.Bucket)] = r.Count
	}

	out := make([]GrowthBucket, 0, days)
	for i := 0; i < days; i++ {
		d := since.AddDate(0, 0, i)
		dEnd := d.AddDate(0, 0, 1)
		out = append(out, GrowthBucket{
			Label:       d.Format("Jan 2"),
			Count:       m[keyDay(d)],
			BucketStart: d.UTC().Format(time.RFC3339),
			BucketEnd:   dEnd.UTC().Format(time.RFC3339),
		})
	}
	return out, nil
}
