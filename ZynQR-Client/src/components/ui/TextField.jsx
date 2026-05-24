import {
  joinFieldClass,
  UI_FIELD_LABEL_AUTH,
  UI_FIELD_LABEL_DEFAULT,
  UI_FIELD_LABEL_EDITORIAL,
} from "../../lib/ui/fieldStyles";

/**
 * Label + input. Variants: `default` (optional `startIcon`), `auth` (compact), `editorial` (forgot/reset flow).
 * Editorial-only: `endIcon` (Material Symbols name), `prefix` (leading static text, e.g. short-link host).
 */
function TextField({
  id,
  label,
  name,
  placeholder,
  type = "text",
  autoComplete,
  startIcon,
  variant = "default",
  labelClassName,
  className,
  endIcon,
  prefix,
  ...inputProps
}) {
  const isAuth = variant === "auth";
  const isEditorial = variant === "editorial";

  if (isEditorial) {
    const labelClass = labelClassName ?? UI_FIELD_LABEL_EDITORIAL;
    if (prefix) {
      return (
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor={id}>
            {label}
          </label>
          <div
            className={joinFieldClass(
              "flex w-full min-w-0 items-center rounded-t-lg border-0 border-b-2 border-outline-variant bg-surface-container-low px-4 py-3 font-body ring-0 transition-colors focus-within:border-primary",
              className,
            )}
          >
            <span className="shrink-0 font-medium text-on-surface-variant select-none">{prefix}</span>
            <input
              id={id}
              name={name}
              placeholder={placeholder}
              type={type}
              autoComplete={autoComplete}
              {...inputProps}
              className="min-w-0 flex-1 border-0 bg-transparent py-0 pr-0 pl-1 font-medium text-on-surface outline-none focus:ring-0"
            />
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor={id}>
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            name={name}
            placeholder={placeholder}
            type={type}
            autoComplete={autoComplete}
            {...inputProps}
            className={joinFieldClass("input-editorial w-full", endIcon && "pr-10", className)}
          />
          {endIcon ? (
            <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-on-surface-variant">
              {endIcon}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  const labelClass = labelClassName ?? (isAuth ? UI_FIELD_LABEL_AUTH : UI_FIELD_LABEL_DEFAULT);

  const inputClass = isAuth
    ? joinFieldClass("auth-field-input", className)
    : startIcon
      ? joinFieldClass("scan-field-input pl-12 pr-4", className)
      : joinFieldClass("scan-field-input pl-4 pr-4", className);

  return (
    <div className="space-y-2">
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        {!isAuth && startIcon ? (
          <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xl text-outline">
            {startIcon}
          </span>
        ) : null}
        <input
          id={id}
          name={name}
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete}
          {...inputProps}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export default TextField;
