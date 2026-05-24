import { useQuery } from "@tanstack/react-query";
import { fetchStaticQrList } from "../api/staticQr.api";
import {
  fetchQrActivity,
  fetchQrAnalyticsSummary,
  fetchQrGrowth,
  fetchQrScanFrequency,
  fetchQrScans,
  listNormalizedQrRows,
} from "../api/qr.api";

export const QR_LIST_QUERY_KEY = ["qr-list"];
export const STATIC_QR_LIST_QUERY_KEY = ["static-qr", "list"];
export const QR_ACTIVITY_QUERY_KEY = ["qr-activity"];
export const QR_GROWTH_QUERY_KEY = ["qr-analytics-growth"];
export const QR_ANALYTICS_SUMMARY_QUERY_KEY = ["qr-analytics-summary"];
export const QR_SCANS_QUERY_KEY = "qr-scans";
export const QR_SCAN_FREQ_QUERY_KEY = "qr-scan-frequency";

export function useQrListQuery(options = {}) {
  return useQuery({
    queryKey: QR_LIST_QUERY_KEY,
    queryFn: listNormalizedQrRows,
    staleTime: 120_000,
    ...options,
  });
}

export function useStaticQrListQuery(options = {}) {
  return useQuery({
    queryKey: STATIC_QR_LIST_QUERY_KEY,
    queryFn: fetchStaticQrList,
    staleTime: 120_000,
    ...options,
  });
}

export function useQrRowById(qrId) {
  const q = useQrListQuery();
  const row = qrId && Array.isArray(q.data) ? q.data.find((r) => r.id === qrId) ?? null : null;
  return { ...q, row };
}

/**
 * @param {{ limit?: number; eventType?: string }} [params]
 * @param {import("@tanstack/react-query").UseQueryOptions} [options]
 */
export function useQrActivityQuery(params = {}, options = {}) {
  const limit = params.limit ?? 10;
  const eventType = params.eventType ?? "";
  return useQuery({
    queryKey: [...QR_ACTIVITY_QUERY_KEY, limit, eventType || "all"],
    queryFn: () => fetchQrActivity(limit, { eventType }),
    staleTime: 120_000,
    ...options,
  });
}

export function useQrAnalyticsSummaryQuery(options = {}) {
  return useQuery({
    queryKey: QR_ANALYTICS_SUMMARY_QUERY_KEY,
    queryFn: fetchQrAnalyticsSummary,
    staleTime: 120_000,
    ...options,
  });
}

/** @param {"daily"|"weekly"|"monthly"} period */
export function useQrGrowthQuery(period, options = {}) {
  return useQuery({
    queryKey: [...QR_GROWTH_QUERY_KEY, period],
    queryFn: () => fetchQrGrowth(period),
    staleTime: 120_000,
    ...options,
  });
}

/**
 * Per-QR scan log rows (GET /qr/scans/:id).
 * @param {string} qrId
 * @param {{ limit?: number }} [params]
 * @param {import("@tanstack/react-query").UseQueryOptions} [options]
 */
export function useQrScansQuery(qrId, params = {}, options = {}) {
  const limit = params.limit ?? 50;
  return useQuery({
    queryKey: [QR_SCANS_QUERY_KEY, qrId, limit],
    queryFn: () => fetchQrScans(qrId, limit),
    enabled: Boolean(qrId),
    staleTime: 60_000,
    ...options,
  });
}

/**
 * Daily scan buckets for one QR (7d / 30d / 90d).
 * @param {string} qrId
 * @param {"7d"|"30d"|"90d"} window
 * @param {import("@tanstack/react-query").UseQueryOptions} [options]
 */
export function useQrScanFrequencyQuery(qrId, window, options = {}) {
  const w = window === "7d" || window === "90d" ? window : "30d";
  return useQuery({
    queryKey: [QR_SCAN_FREQ_QUERY_KEY, qrId, w],
    queryFn: () => fetchQrScanFrequency(qrId, w),
    enabled: Boolean(qrId),
    staleTime: 120_000,
    ...options,
  });
}
