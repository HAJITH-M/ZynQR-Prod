import axiosInstance from "./axiosInstance";

/** Origin for `/qr/:id` links (matches backend `PUBLIC_APP_URL` / server host). */
export function getPublicScanOrigin() {
  const explicit = import.meta.env.VITE_PUBLIC_APP_URL;
  if (explicit && String(explicit).trim()) {
    return String(explicit).replace(/\/$/, "");
  }
  const api = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const stripped = api.replace(/\/api\/v1$/i, "");
  return stripped || api;
}

export function scanUrlForQrId(id) {
  const origin = getPublicScanOrigin();
  return origin ? `${origin}/qr/${id}` : `/qr/${id}`;
}

/** My QRs table: same Material icon + colors for every row. */
const QR_ROW_ICON = "qr_code_2";
const QR_ROW_ICON_BG = "bg-primary-fixed";
const QR_ROW_ICON_COLOR = "text-primary";

/**
 * Map one API QR record (Go JSON uses PascalCase on most fields) to table / UI row shape.
 * @param {Record<string, unknown>} q
 */
export function normalizeQrRecord(q) {
  const id = String(q.ID ?? q.id ?? "");
  const name = String(q.QrName ?? q.qr_name ?? "");
  const destination = String(q.DestinationURL ?? q.destination_url ?? "");
  const statusRaw = String(q.Status ?? q.status ?? "active").toLowerCase();
  const isActive = statusRaw === "active";
  const scans = Number(q.scan_count ?? q.ScanCount ?? 0) || 0;
  const createdRaw = q.CreatedAt ?? q.created_at;
  let created = "—";
  if (createdRaw) {
    const d = new Date(String(createdRaw));
    if (!Number.isNaN(d.getTime())) {
      created = d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    }
  }
  const shortLink = scanUrlForQrId(id);
  const rawAe = q.analytics_enabled ?? q.AnalyticsEnabled;
  const analyticsEnabled = rawAe === undefined || rawAe === null ? true : Boolean(rawAe);

  return {
    id,
    name: name || "Untitled",
    created,
    shortLink,
    destination,
    scans,
    status: isActive ? "active" : "inactive",
    analyticsEnabled,
    icon: QR_ROW_ICON,
    iconBg: QR_ROW_ICON_BG,
    iconColor: QR_ROW_ICON_COLOR,
    qrImageUrl: String(q.QrImageURL ?? q.qr_image_url ?? ""),
  };
}

export async function fetchQrListRaw() {
  const res = await axiosInstance.get("/qr/get");
  return res.data;
}

export async function listNormalizedQrRows() {
  const data = await fetchQrListRaw();
  const raw = data.qrs ?? data.QRS ?? [];
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeQrRecord);
}

export async function createQr({ email, qr_name, destination_url, analytics_enabled = true }) {
  const res = await axiosInstance.post("/qr/create", {
    email,
    qr_name,
    destination_url,
    analytics_enabled,
  });
  return res.data;
}

export async function updateQr(id, body) {
  const res = await axiosInstance.put(`/qr/update/${id}`, body);
  return res.data;
}

export async function deleteQr(qr_id) {
  const res = await axiosInstance.delete("/qr/delete", {
    data: { qr_id },
  });
  return res.data;
}

/**
 * @typedef {Object} QrActivityRow
 * @property {string} id
 * @property {string} qrId
 * @property {string} eventType
 * @property {string} title
 * @property {string} detail
 * @property {string} qrName display name parsed from detail (e.g. scan rows: "Name • ID: …")
 * @property {string} [clientIp]
 * @property {string} [city]
 * @property {string} [country]
 * @property {string} [userAgent]
 * @property {string} createdAt ISO
 * @property {string} scannedAt same instant as createdAt for scan rows (for display)
 * @property {string} icon Material symbol
 * @property {string} iconWrap Tailwind classes for icon circle
 */

/** @param {string} detail */
function qrDisplayNameFromActivityDetail(detail) {
  const d = String(detail ?? "").trim();
  if (!d) return "—";
  const sep = " • ID:";
  const i = d.indexOf(sep);
  if (i === -1) return d;
  const name = d.slice(0, i).trim();
  return name || "—";
}

function activityVisual(eventType) {
  switch (eventType) {
    case "scan":
      return { icon: "location_on", iconWrap: "bg-blue-100 text-blue-600" };
    case "qr_updated":
      return { icon: "edit", iconWrap: "bg-orange-100 text-orange-600" };
    case "qr_created":
      return { icon: "add_circle", iconWrap: "bg-emerald-100 text-emerald-600" };
    case "qr_deleted":
      return { icon: "delete", iconWrap: "bg-red-100 text-red-600" };
    default:
      return { icon: "notifications", iconWrap: "bg-surface-container-high text-on-surface-variant" };
  }
}

/**
 * @param {Record<string, unknown>} raw
 * @returns {QrActivityRow}
 */
export function normalizeQrActivityItem(raw) {
  const eventType = String(raw.event_type ?? raw.EventType ?? "");
  const title = String(raw.title ?? raw.Title ?? "");
  const detail = String(raw.detail ?? raw.Detail ?? "");
  const id = String(raw.id ?? raw.ID ?? "");
  const qrId = String(raw.qr_id ?? raw.QrID ?? raw.qrId ?? "");
  const createdRaw = raw.created_at ?? raw.CreatedAt;
  const createdAt = createdRaw ? new Date(String(createdRaw)).toISOString() : new Date().toISOString();
  const clientIp = raw.client_ip != null ? String(raw.client_ip) : raw.ClientIP != null ? String(raw.ClientIP) : "";
  const city = raw.city != null ? String(raw.city) : raw.City != null ? String(raw.City) : "";
  const country =
    raw.country != null ? String(raw.country) : raw.Country != null ? String(raw.Country) : "";
  const userAgent =
    raw.user_agent != null
      ? String(raw.user_agent)
      : raw.UserAgent != null
        ? String(raw.UserAgent)
        : "";
  const vis = activityVisual(eventType);
  const scannedAt = eventType === "scan" ? createdAt : "";
  const qrName = qrDisplayNameFromActivityDetail(detail);
  return {
    id,
    qrId,
    eventType,
    title,
    detail,
    qrName,
    clientIp,
    city,
    country,
    userAgent,
    createdAt,
    scannedAt,
    icon: vis.icon,
    iconWrap: vis.iconWrap,
  };
}

/**
 * @param {number} limit
 * @param {{ eventType?: string }} [opts]
 */
export async function fetchQrActivity(limit = 10, opts = {}) {
  const params = { limit };
  if (opts.eventType && String(opts.eventType).trim()) {
    params.event_type = String(opts.eventType).trim();
  }
  const res = await axiosInstance.get("/qr/activity", { params });
  const data = res.data;
  const items = data.items ?? data.Items ?? [];
  if (!Array.isArray(items)) return [];
  return items.map(normalizeQrActivityItem);
}

/**
 * @param {unknown} raw
 */
function normalizeScanSampleInsights(raw) {
  const sample = raw?.scan_sample ?? raw?.ScanSample ?? raw ?? {};
  const device = sample.device_share ?? sample.DeviceShare ?? {};
  const browsers = sample.top_browsers ?? sample.TopBrowsers ?? [];
  return {
    sampleSize: Number(sample.sample_size ?? sample.SampleSize ?? 0) || 0,
    hasUserAgent: Boolean(sample.has_user_agent ?? sample.HasUserAgent),
    deviceShare: {
      mobilePct: Number(device.mobile_pct ?? device.MobilePct ?? 0) || 0,
      desktopPct: Number(device.desktop_pct ?? device.DesktopPct ?? 0) || 0,
      tabletPct: Number(device.tablet_pct ?? device.TabletPct ?? 0) || 0,
    },
    topBrowsers: Array.isArray(browsers)
      ? browsers.map((b) => ({
          label: String(b.label ?? b.Label ?? ""),
          pct: Number(b.pct ?? b.Pct ?? 0) || 0,
        }))
      : [],
  };
}

/**
 * Global analytics summary cards (GET /qr/analytics/summary).
 */
export async function fetchQrAnalyticsSummary() {
  const res = await axiosInstance.get("/qr/analytics/summary");
  const raw = res.data?.summary ?? res.data?.Summary ?? res.data;
  return {
    totalAggregateScans: Number(raw.total_aggregate_scans ?? raw.TotalAggregateScans ?? 0) || 0,
    totalQrCount: Number(raw.total_qr_count ?? raw.TotalQrCount ?? 0) || 0,
    activeQrCount: Number(raw.active_qr_count ?? raw.ActiveQrCount ?? 0) || 0,
    conversionRate: Number(raw.conversion_rate ?? raw.ConversionRate ?? 0) || 0,
    qrsWithScans: Number(raw.qrs_with_scans ?? raw.QrsWithScans ?? 0) || 0,
    scanSample: normalizeScanSampleInsights(raw),
  };
}

/**
 * @param {"daily"|"weekly"|"monthly"} period
 * @returns {Promise<{ label: string; count: number; bucketStart: string; bucketEnd: string }[]>}
 */
export async function fetchQrGrowth(period = "daily") {
  const res = await axiosInstance.get("/qr/analytics/growth", { params: { period } });
  const data = res.data;
  const buckets = data.buckets ?? data.Buckets ?? [];
  if (!Array.isArray(buckets)) return [];
  return buckets.map((b) => ({
    label: String(b.label ?? b.Label ?? ""),
    count: Number(b.count ?? b.Count ?? 0) || 0,
    bucketStart: String(b.bucket_start ?? b.BucketStart ?? ""),
    bucketEnd: String(b.bucket_end ?? b.BucketEnd ?? ""),
  }));
}

/**
 * Per-QR daily scan frequency (GET /qr/analytics/scan-frequency/:id?window=7d|30d|90d).
 * @param {string} qrId
 * @param {"7d"|"30d"|"90d"} [window]
 */
export async function fetchQrScanFrequency(qrId, window = "30d") {
  const res = await axiosInstance.get(`/qr/analytics/scan-frequency/${encodeURIComponent(qrId)}`, {
    params: { window },
  });
  const data = res.data;
  const buckets = data.buckets ?? data.Buckets ?? [];
  if (!Array.isArray(buckets)) return [];
  return buckets.map((b) => ({
    label: String(b.label ?? b.Label ?? ""),
    count: Number(b.count ?? b.Count ?? 0) || 0,
    bucketStart: String(b.bucket_start ?? b.BucketStart ?? ""),
    bucketEnd: String(b.bucket_end ?? b.BucketEnd ?? ""),
  }));
}

/**
 * One row from GET /qr/scans/:id (per physical scan of /qr/:id).
 * @param {Record<string, unknown>} raw
 * @returns {{
 *   id: string;
 *   scannedAt: string;
 *   clientIp: string;
 *   city: string;
 *   country: string;
 *   userAgent: string;
 *   locationLabel: string;
 * }}
 */
export function normalizeQrScanItem(raw) {
  const id = String(raw.id ?? raw.ID ?? "");
  const scannedRaw = raw.scanned_at ?? raw.ScannedAt ?? raw.created_at ?? raw.CreatedAt;
  let scannedAt = "";
  if (scannedRaw) {
    const d = new Date(String(scannedRaw));
    if (!Number.isNaN(d.getTime())) scannedAt = d.toISOString();
  }
  const clientIp =
    raw.client_ip != null ? String(raw.client_ip) : raw.ClientIP != null ? String(raw.ClientIP) : "";
  const city = raw.city != null ? String(raw.city) : raw.City != null ? String(raw.City) : "";
  const country =
    raw.country != null ? String(raw.country) : raw.Country != null ? String(raw.Country) : "";
  const userAgent =
    raw.user_agent != null
      ? String(raw.user_agent)
      : raw.UserAgent != null
        ? String(raw.UserAgent)
        : "";
  const locationLabel = [city, country].filter(Boolean).join(", ") || "—";
  return { id, scannedAt, clientIp, city, country, userAgent, locationLabel };
}

/**
 * @param {string} qrId
 * @param {number} [limit]
 */
export async function fetchQrScans(qrId, limit = 50) {
  const res = await axiosInstance.get(`/qr/scans/${encodeURIComponent(qrId)}`, {
    params: { limit },
  });
  const data = res.data;
  const items = data.items ?? data.Items ?? [];
  if (!Array.isArray(items)) return [];
  return items.map(normalizeQrScanItem);
}
