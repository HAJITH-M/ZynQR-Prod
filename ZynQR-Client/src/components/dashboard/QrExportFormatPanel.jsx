import {
  QR_EXPORT_FORMATS,
  qrDownloadBtnActiveClass,
  qrDownloadBtnIdleClass,
} from "../../lib/dashboard/constants";
import { useQrExportDownload } from "../../hooks/dashboard/useQrExportDownload";

/**
 * QR preview (left) + PNG / SVG / EPS format pickers and download — matches individual analytics layout.
 *
 * @param {{
 *   imageSrc: string;
 *   fileStem: string;
 *   children: import("react").ReactNode;
 * }} props
 */
export default function QrExportFormatPanel({ imageSrc, fileStem, children }) {
  const {
    exportFormat,
    setExportFormat,
    ready,
    busy,
    convertError,
    url,
    safeStem,
    handleVectorDownload,
  } = useQrExportDownload({ imageSrc, fileStem });

  return (
    <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col gap-4 sm:gap-5">
      <div className="grid min-h-0 w-full flex-1 grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 md:items-center">
        <div className="flex min-h-0 w-full items-center justify-center">{children}</div>
        <div className="flex w-full min-w-0 flex-col justify-center gap-3">
          <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
            Download format
          </p>
          <div className="flex w-full flex-col gap-2" role="radiogroup" aria-label="Choose download format">
            {QR_EXPORT_FORMATS.map((id) => {
              const selected = exportFormat === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={
                    selected
                      ? "w-full rounded-xl border-2 border-primary bg-primary/12 py-2.5 text-xs font-black text-primary shadow-sm sm:py-3 sm:text-sm"
                      : "w-full rounded-xl border border-outline-variant/35 bg-surface-container-low py-2.5 text-xs font-bold text-on-surface transition-colors hover:border-primary/45 hover:bg-primary/5 sm:py-3 sm:text-sm"
                  }
                  onClick={() => setExportFormat(id)}
                >
                  {id.toUpperCase()}
                </button>
              );
            })}
          </div>
          {!ready ? (
            <p className="text-[11px] leading-snug text-on-surface-variant">
              {!exportFormat
                ? "Select a format to enable download."
                : "PNG preview is not available for this QR yet."}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col gap-2 border-t border-outline-variant/20 pt-4">
        {ready && exportFormat === "png" ? (
          <a
            className={qrDownloadBtnActiveClass}
            download={`qr-${safeStem}.png`}
            href={url}
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined">download</span>
            Download
          </a>
        ) : (
          <button
            className={ready ? qrDownloadBtnActiveClass : qrDownloadBtnIdleClass}
            disabled={!ready || busy}
            type="button"
            onClick={() => void handleVectorDownload()}
          >
            <span className="material-symbols-outlined">download</span>
            {busy ? "Preparing…" : "Download"}
          </button>
        )}
        {convertError ? (
          <p className="text-center text-[11px] leading-snug text-error">{convertError}</p>
        ) : null}
      </div>
    </div>
  );
}
