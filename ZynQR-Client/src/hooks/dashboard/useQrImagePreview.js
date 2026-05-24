import { useState } from "react";
import { rowToQrPreviewState } from "../../lib/dashboard/qrTable";

/**
 * @typedef {{ src: string; title: string; fileStem: string } | null} QrPreviewState
 */

export function useQrImagePreview() {
  const [preview, setPreview] = useState(/** @type {QrPreviewState} */ (null));

  /** @param {{ id: string; name: string; qrImageUrl?: string; image_data_url?: string }} row */
  function openPreviewFromRow(row) {
    const next = rowToQrPreviewState(row);
    if (next) setPreview(next);
  }

  function closePreview() {
    setPreview(null);
  }

  return {
    preview,
    openPreviewFromRow,
    closePreview,
    isOpen: Boolean(preview),
  };
}
