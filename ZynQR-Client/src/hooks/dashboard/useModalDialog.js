import { useEffect } from "react";

/**
 * Escape to close + lock body scroll while a modal is open.
 * @param {{ open: boolean; onClose: () => void; pending?: boolean }} options
 */
export function useModalDialog({ open, onClose, pending = false }) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape" && !pending) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, pending]);
}
