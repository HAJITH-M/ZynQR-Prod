import { UI_OTP_CELL_CLASS } from "../../lib/ui/fieldStyles";
import { useOtpField } from "../../hooks/ui/useOtpField";

/**
 * Row of single-character OTP inputs.
 * Auto-advances focus after a digit; Backspace on empty moves to previous; paste fills from current cell.
 */
function OtpField({
  length = 6,
  name = "otp",
  disabled = false,
  digitAriaLabel = "Verification digit",
  className,
  ...containerProps
}) {
  const { setRef, handleChange, handleKeyDown, handlePaste } = useOtpField({
    length,
    disabled,
  });

  return (
    <div
      className={`flex justify-between gap-2${className ? ` ${className}` : ""}`}
      {...containerProps}
    >
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={setRef(i)}
          aria-label={`${digitAriaLabel} ${i + 1}`}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          className={UI_OTP_CELL_CLASS}
          disabled={disabled}
          inputMode="numeric"
          maxLength={1}
          name={`${name}_${i}`}
          pattern="[0-9]*"
          type="text"
          onChange={handleChange(i)}
          onKeyDown={handleKeyDown(i)}
          onPaste={handlePaste(i)}
        />
      ))}
    </div>
  );
}

export default OtpField;
