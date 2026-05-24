/**
 * @param {number} n
 */
export function formatScans(n) {
  return n.toLocaleString("en-US");
}

/**
 * @param {{ id: string; name: string; qrImageUrl?: string; image_data_url?: string }} row
 */
export function rowToQrPreviewState(row) {
  const src = (row.qrImageUrl ?? row.image_data_url ?? "").trim();
  if (!src) return null;
  return { src, title: row.name, fileStem: row.id };
}
