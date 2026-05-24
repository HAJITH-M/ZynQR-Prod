/** Local wall-clock date + time for activity / scan rows. */
/** @param {string} iso */
export function formatActivityDateTime(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** UTC range label for growth chart buckets ([start, end) from API). */
/** @param {string} startIso */
/** @param {string} endIso */
export function formatGrowthBucketUtcRange(startIso, endIso) {
  if (!startIso || !endIso) return "";
  const start = new Date(startIso);
  const end = new Date(endIso);
  const last = new Date(end.getTime() - 1);
  const fmt = (d) =>
    d.toLocaleString(undefined, {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  return `${fmt(start)} – ${fmt(last)} UTC`;
}

/** @param {string} iso */
export function formatRelativeTime(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const sec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (sec < 60) return `${Math.max(1, sec)}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
