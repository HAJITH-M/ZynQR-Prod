import { UAParser } from "ua-parser-js";

/** Max countries shown in Global Scan Reach. */
export const GLOBAL_SCAN_TOP_COUNTRIES = 5;

/**
 * @typedef {{ name: string; count: number; pct: number; barPct: number }} CountryRow
 * @typedef {{ mobile: number; desktop: number; tablet: number; mobilePct: number; desktopPct: number; tabletPct: number }} DeviceSplit
 * @typedef {{ label: string; pct: number }[]} BrowserGrid
 * @typedef {{ countries: CountryRow[]; topRegionLabel: string; devices: DeviceSplit; browsers: BrowserGrid; sampleSize: number; hasGeo: boolean; hasUa: boolean }} ScanInsights
 */

/** @param {number} m @param {number} d @param {number} t */
function devicePercents(m, d, t) {
  const total = m + d + t;
  if (!total) {
    return { mobilePct: 0, desktopPct: 0, tabletPct: 0 };
  }
  let mp = Math.round((m / total) * 100);
  let dp = Math.round((d / total) * 100);
  let tp = Math.round((t / total) * 100);
  const diff = 100 - (mp + dp + tp);
  if (diff !== 0) {
    const max = Math.max(m, d, t);
    if (max === m) mp += diff;
    else if (max === d) dp += diff;
    else tp += diff;
  }
  return { mobilePct: mp, desktopPct: dp, tabletPct: tp };
}

/** @param {string} [rawName] */
function bucketBrowser(rawName) {
  const n = String(rawName || "").toLowerCase();
  if (!n.trim()) return "other";
  if (n.includes("edg")) return "edge";
  if (n.includes("crios") || (n.includes("chrome") && !n.includes("edg"))) return "chrome";
  if (n.includes("safari")) return "safari";
  return "other";
}

/**
 * Aggregates recent scan activity rows (same shape as normalizeQrActivityItem output).
 * @param {Array<{ country?: string; userAgent?: string; eventType?: string }>} rows
 */
export function buildScanInsights(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const n = list.length;

  const countryCount = new Map();
  for (const r of list) {
    const c = String(r.country ?? "").trim();
    const key = c || "Unknown location";
    countryCount.set(key, (countryCount.get(key) ?? 0) + 1);
  }

  const sorted = [...countryCount.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, GLOBAL_SCAN_TOP_COUNTRIES);
  const maxCountry = top[0]?.[1] ?? 1;

  /** @type {CountryRow[]} */
  const countries = top.map(([name, count]) => ({
    name,
    count,
    pct: n ? Math.round((count / n) * 100) : 0,
    barPct: maxCountry ? Math.round((count / maxCountry) * 100) : 0,
  }));

  const topName = top[0]?.[0] ?? "";
  const topPct = top[0] && n ? Math.round((top[0][1] / n) * 100) : 0;
  const topRegionLabel =
    n === 0
      ? "No scans in this sample yet"
      : topName === "Unknown location"
        ? "Country unavailable for recent scans (e.g. local / private IP)"
        : `Top region: ${topName} (${topPct}%)`;

  let mobile = 0;
  let desktop = 0;
  let tablet = 0;
  let uaHits = 0;

  for (const r of list) {
    const ua = String(r.userAgent ?? "").trim();
    if (!ua) {
      desktop += 1;
      continue;
    }
    uaHits += 1;
    const type = new UAParser(ua).getDevice().type;
    if (type === "mobile") mobile += 1;
    else if (type === "tablet") tablet += 1;
    else desktop += 1;
  }

  const { mobilePct, desktopPct, tabletPct } = devicePercents(mobile, desktop, tablet);

  let safari = 0;
  let chrome = 0;
  let edge = 0;
  let other = 0;

  for (const r of list) {
    const ua = String(r.userAgent ?? "").trim();
    const b = bucketBrowser(ua ? new UAParser(ua).getBrowser().name : "");
    if (b === "safari") safari += 1;
    else if (b === "chrome") chrome += 1;
    else if (b === "edge") edge += 1;
    else other += 1;
  }

  const bTotal = safari + chrome + edge + other || 1;
  const roundB = (x) => Math.round((x / bTotal) * 100);
  let sp = roundB(safari);
  let cp = roundB(chrome);
  let ep = roundB(edge);
  let op = roundB(other);
  const bDiff = 100 - (sp + cp + ep + op);
  if (bDiff !== 0) {
    const maxB = Math.max(safari, chrome, edge, other);
    if (maxB === safari) sp += bDiff;
    else if (maxB === chrome) cp += bDiff;
    else if (maxB === edge) ep += bDiff;
    else op += bDiff;
  }

  /** @type {BrowserGrid} */
  const browsers = [
    { label: "Safari", pct: sp },
    { label: "Chrome", pct: cp },
    { label: "Edge", pct: ep },
    { label: "Other", pct: op },
  ];

  const hasGeo = sorted.some(([name]) => name !== "Unknown location");
  const hasUa = uaHits > 0;

  return {
    countries,
    topRegionLabel,
    devices: {
      mobile,
      desktop,
      tablet,
      mobilePct,
      desktopPct,
      tabletPct,
    },
    browsers,
    sampleSize: n,
    hasGeo,
    hasUa,
  };
}
