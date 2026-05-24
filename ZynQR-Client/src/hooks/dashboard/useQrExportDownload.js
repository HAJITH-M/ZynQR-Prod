import { useEffect, useState } from "react";
import {
  buildEpsFromPngUrl,
  buildSvgWrapperFromPngUrl,
  canDownloadQrExport,
  safeDownloadBasename,
  triggerDownloadBlob,
} from "../../utils/qrExportFormats";

/** @typedef {'png' | 'svg' | 'eps'} QrExportFormat */

/**
 * Format selection + vector export download for QrExportFormatPanel.
 * @param {{ imageSrc: string; fileStem: string }} params
 */
export function useQrExportDownload({ imageSrc, fileStem }) {
  const [exportFormat, setExportFormat] = useState(/** @type {QrExportFormat | null} */ (null));
  const [busy, setBusy] = useState(false);
  const [convertError, setConvertError] = useState(/** @type {string | null} */ (null));

  const url = imageSrc?.trim() ?? "";
  const ready = canDownloadQrExport(exportFormat, url);
  const safeStem = safeDownloadBasename(fileStem);

  useEffect(() => {
    setConvertError(null);
  }, [exportFormat, url]);

  async function handleVectorDownload() {
    if (!ready || !exportFormat || exportFormat === "png") return;
    setConvertError(null);
    setBusy(true);
    try {
      if (exportFormat === "svg") {
        const svg = await buildSvgWrapperFromPngUrl(url);
        triggerDownloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `qr-${safeStem}.svg`);
      } else {
        const eps = await buildEpsFromPngUrl(url);
        triggerDownloadBlob(new Blob([eps], { type: "application/postscript" }), `qr-${safeStem}.eps`);
      }
    } catch (e) {
      setConvertError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  return {
    exportFormat,
    setExportFormat,
    ready,
    busy,
    convertError,
    url,
    safeStem,
    handleVectorDownload,
  };
}
