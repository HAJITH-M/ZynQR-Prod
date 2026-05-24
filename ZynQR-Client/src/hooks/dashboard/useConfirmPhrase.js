import { useEffect, useRef, useState } from "react";

/**
 * Typed confirmation gate for destructive modals.
 * @param {string} phrase — expected value (use `caseSensitive` for exact match)
 * @param {{ open: boolean; resetKey?: string; caseSensitive?: boolean }} options
 */
export function useConfirmPhrase(phrase, { open, resetKey = "", caseSensitive = false }) {
  const inputRef = useRef(null);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (!open) return;
    setConfirmText("");
  }, [open, resetKey]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, resetKey]);

  const trimmed = confirmText.trim();
  const canConfirm = caseSensitive
    ? trimmed === phrase
    : trimmed.toLowerCase() === phrase.toLowerCase();

  return {
    inputRef,
    confirmText,
    setConfirmText,
    canConfirm,
  };
}
