/**
 * @param {{ detail?: string; qrName?: string }} item
 */
export function scanQrDisplayName(item) {
  const fromField = String(item.qrName ?? "").trim();
  if (fromField) return fromField;
  const d = String(item.detail ?? "").trim();
  if (!d) return "—";
  const sep = " • ID:";
  const i = d.indexOf(sep);
  return (i === -1 ? d : d.slice(0, i)).trim() || "—";
}

/** @param {{ detail?: string; qrName?: string }} item */
export function activityEntityLabel(item) {
  const fromField = String(item.qrName ?? "").trim();
  if (fromField && fromField !== "—") return fromField;
  return scanQrDisplayName(item);
}

/** @param {string} text @param {number} max */
export function truncateText(text, max) {
  const s = String(text ?? "").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

/**
 * @param {{ eventType?: string; detail?: string }} row
 */
export function activityDetailsText(row) {
  return row.eventType === "scan" ? "1 scan" : truncateText(row.detail, 96);
}

/**
 * @param {{ city?: string; country?: string; clientIp?: string }} row
 */
export function activityLocationLine(row) {
  const loc = [row.city, row.country].filter(Boolean).join(", ");
  const locLine = loc || "Approx. location unknown";
  return row.clientIp ? `${locLine} · ${row.clientIp}` : locLine;
}

/**
 * @param {{ qrName?: string; qrId?: string; clientIp?: string; createdAt: string }} row
 * @param {number} serialNo
 */
export function formatGlobalScanLogRow(row, serialNo) {
  const qrName = row.qrName ?? "—";
  return {
    serialNo,
    qrName,
    scanTimeTitle: row.createdAt,
    qrIdShort: row.qrId ? `${row.qrId.slice(0, 8)}…` : "—",
    qrIdTitle: row.qrId || undefined,
    clientIp: row.clientIp || "—",
    clientIpTitle: row.clientIp || undefined,
  };
}
