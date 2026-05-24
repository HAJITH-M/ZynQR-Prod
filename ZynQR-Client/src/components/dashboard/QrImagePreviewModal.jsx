import { useModalDialog } from "../../hooks/dashboard/useModalDialog";
import QrExportFormatPanel from "./QrExportFormatPanel";

/**
 * Centered preview dialog with the same PNG / SVG / EPS flow as individual QR analytics.
 *
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   imageSrc: string;
 *   title: string;
 *   fileStem: string;
 * }} props
 */
export default function QrImagePreviewModal({ open, onClose, imageSrc, title, fileStem }) {
  useModalDialog({ open, onClose });

  if (!open || !imageSrc?.trim()) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-preview-title"
      >
        <button
          type="button"
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
          aria-label="Close"
          onClick={onClose}
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
        <div className="relative px-5 pb-8 pt-12 sm:px-8 sm:pt-14">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-60" />
          <div className="relative">
            <h2 id="qr-preview-title" className="font-headline pr-10 text-lg font-bold text-on-surface sm:text-xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Choose a format, then download — same options as the QR analytics page.
            </p>
            <div className="relative mt-6 overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm sm:p-8">
              <QrExportFormatPanel fileStem={fileStem} imageSrc={imageSrc.trim()}>
                <div className="flex aspect-square w-full max-w-[220px] items-center justify-center rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-on-surface/5 sm:max-w-[260px] md:max-w-[min(100%,280px)] lg:max-h-[min(280px,40vh)]">
                  <img alt="" className="h-full w-full object-contain" src={imageSrc} />
                </div>
              </QrExportFormatPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
