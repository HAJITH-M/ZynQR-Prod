/** Account delete confirmation phrase (case-insensitive). */
export const ACCOUNT_DELETE_CONFIRM_PHRASE = "delete";

/** QR code delete confirmation phrase (exact match). */
export const QR_DELETE_CONFIRM_PHRASE = "DELETE";

export const SCAN_LOG_PAGE_SIZE = 10;

export const QR_ACTIVITY_TABLE_PAGE_SIZE = 10;

export const QR_EXPORT_FORMATS = ["png", "svg", "eps"];

export const scanPagerBtnClass =
  "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-2 text-sm font-bold text-on-surface transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface-container-lowest";

export const tablePagerBtnClass = scanPagerBtnClass;

export const qrDownloadBtnBaseClass =
  "flex w-full items-center justify-center gap-3 rounded-xl py-3.5 text-sm font-bold transition-colors sm:py-4";

export const qrDownloadBtnActiveClass = `${qrDownloadBtnBaseClass} bg-on-surface text-white hover:bg-black`;

export const qrDownloadBtnIdleClass = `${qrDownloadBtnBaseClass} cursor-not-allowed bg-on-surface/35 text-white opacity-60`;
