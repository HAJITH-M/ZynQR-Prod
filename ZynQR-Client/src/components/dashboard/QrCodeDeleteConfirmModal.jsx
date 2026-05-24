import { useId } from "react";
import { QR_DELETE_CONFIRM_PHRASE } from "../../lib/dashboard/constants";
import { useConfirmPhrase } from "../../hooks/dashboard/useConfirmPhrase";
import { useModalDialog } from "../../hooks/dashboard/useModalDialog";

/**
 * @typedef {Object} QrCodeRowLite
 * @property {string} id
 * @property {string} name
 */

/**
 * @param {{
 *   open: boolean;
 *   row: QrCodeRowLite | null;
 *   onClose: () => void;
 *   onConfirm: () => void | Promise<void>;
 *   pending?: boolean;
 * }} props
 */
export default function QrCodeDeleteConfirmModal({ open, row, onClose, onConfirm, pending = false }) {
  const inputId = useId();
  const { inputRef, confirmText, setConfirmText, canConfirm } = useConfirmPhrase(QR_DELETE_CONFIRM_PHRASE, {
    open,
    resetKey: row?.id ?? "",
    caseSensitive: true,
  });

  useModalDialog({ open, onClose, pending });

  if (!open || !row) return null;

  return (
    <div
      aria-labelledby="delete-qr-title"
      aria-modal="true"
      className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden px-4"
      role="dialog"
    >
      <button
        aria-label="Dismiss"
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
        type="button"
        onClick={() => !pending && onClose()}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-lowest shadow-2xl">
        <div className="p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error-container">
              <span
                className="material-symbols-outlined text-4xl text-error"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
            </div>
            <h2 className="mb-3 font-headline text-2xl font-extrabold tracking-tight text-on-surface" id="delete-qr-title">
              Delete QR Code?
            </h2>
            <p className="font-medium leading-relaxed text-on-surface-variant">
              Are you sure you want to delete this QR code? This action cannot be undone and all scan data will be
              permanently removed.
            </p>
          </div>
          <div className="mb-6">
            <label
              className="mb-2 block px-1 text-xs font-bold tracking-widest text-on-surface-variant uppercase"
              htmlFor={inputId}
            >
              Type &quot;DELETE&quot; to confirm
            </label>
            <input
              ref={inputRef}
              autoComplete="off"
              className="w-full rounded-2xl border-2 border-transparent bg-surface-container-low px-6 py-4 font-medium text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:border-primary-container focus:ring-0"
              id={inputId}
              placeholder={`Type ${QR_DELETE_CONFIRM_PHRASE} here`}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-3">
            <button
              aria-disabled={!canConfirm || pending}
              className="w-full rounded-full bg-primary-container py-4 text-lg font-bold text-on-primary shadow-lg shadow-primary-container/30 transition-all active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canConfirm || pending}
              type="button"
              onClick={() => void onConfirm()}
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
            <button
              className="w-full rounded-full bg-surface-container-high py-4 text-lg font-bold text-on-surface transition-all hover:bg-surface-container-highest active:scale-95 disabled:opacity-50"
              disabled={pending}
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        <div className="flex items-center justify-center gap-2 bg-surface-container-low px-8 py-4">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">info</span>
          <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">
            Asset: {row.name}
          </span>
        </div>
        </div>
      </div>
    </div>
  );
}
