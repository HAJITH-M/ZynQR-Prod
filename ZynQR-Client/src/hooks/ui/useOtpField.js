import { useRef } from "react";

/**
 * OTP digit row: focus advance, backspace, arrows, paste.
 * @param {{ length?: number; disabled?: boolean }} options
 */
export function useOtpField({ length = 6, disabled = false } = {}) {
  const inputsRef = useRef([]);

  const setRef = (index) => (el) => {
    inputsRef.current[index] = el;
  };

  const handleChange = (index) => (e) => {
    if (disabled) return;
    const raw = e.target.value.replace(/\D/g, "");
    const digit = raw.slice(-1);
    e.target.value = digit;
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index) => (e) => {
    if (disabled) return;
    if (e.key === "Backspace") {
      if (!e.currentTarget.value && index > 0) {
        e.preventDefault();
        const prev = inputsRef.current[index - 1];
        if (prev) {
          prev.focus();
          prev.value = "";
        }
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index) => (e) => {
    if (disabled) return;
    e.preventDefault();
    const digits = (e.clipboardData.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!digits) return;
    for (let j = 0; j < digits.length && index + j < length; j++) {
      const input = inputsRef.current[index + j];
      if (input) input.value = digits[j];
    }
    const focusAt = Math.min(index + digits.length, length - 1);
    inputsRef.current[focusAt]?.focus();
  };

  return { setRef, handleChange, handleKeyDown, handlePaste };
}
