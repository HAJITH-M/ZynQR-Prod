import { toast as sonnerToast } from "sonner";

/** @param {unknown} body */
function formatErrorBody(body) {
  if (body == null) return "";
  if (typeof body === "string") return body.trim();
  if (typeof body === "object") {
    const values = Object.values(body).filter((v) => typeof v === "string" && v.trim());
    if (values.length > 0) return String(values[0]).trim();
  }
  const s = String(body).trim();
  return s === "[object Object]" ? "" : s;
}

/**
 * Best-effort message from an axios-style error (response body, status, or Error#message).
 * @param {unknown} error
 * @param {string} [fallback]
 */
export function getApiErrorMessage(error, fallback = "") {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const fromBody = data?.error ?? data?.message ?? data?.hint;

  if (status === 429) {
    const m = formatErrorBody(fromBody);
    return m || "Too many requests. Please wait a moment before trying again.";
  }

  const formatted = formatErrorBody(fromBody);
  if (formatted) {
    return formatted;
  }

  if (error?.message && String(error.message).trim()) {
    return String(error.message);
  }

  return fallback || "Something went wrong";
}

/** Show an error toast for API / network failures. Skips 429 — those are shown once from the axios interceptor. */
export function toastApiError(error, fallback = "Something went wrong") {
  if (error?.response?.status === 429) {
    return;
  }
  sonnerToast.error(getApiErrorMessage(error, fallback));
}

export function toastSuccess(message) {
  sonnerToast.success(String(message));
}

export function toastWarning(message) {
  sonnerToast.warning(String(message));
}

export function toastInfo(message) {
  sonnerToast.message(String(message));
}

export const toast = sonnerToast;
