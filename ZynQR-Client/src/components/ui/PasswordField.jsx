import { useState } from "react";
import {
  joinFieldClass,
  UI_FIELD_LABEL_AUTH_PASSWORD,
  UI_FIELD_LABEL_DEFAULT,
  UI_FIELD_LABEL_EDITORIAL,
  UI_FIELD_LABEL_SETTINGS,
} from "../../lib/ui/fieldStyles";

/**
 * Password field.
 * - `default`: register (lock + visibility).
 * - `auth`: login (`auth-field-input` + visibility toggle unless `showVisibilityToggle={false}`).
 * - `editorial`: forgot/reset (`input-editorial`); set `showVisibilityToggle` for reveal control.
 * - `settings`: change-password (`settings-field-input`); visibility toggle unless `showVisibilityToggle={false}`; optional `labelAccessory`; `belowInput` when no accessory.
 */
function PasswordField({
  id,
  label,
  name,
  placeholder = "••••••••",
  autoComplete,
  variant = "default",
  labelClassName,
  labelAccessory,
  showVisibilityToggle,
  belowInput,
  className,
  ...inputProps
}) {
  const [visible, setVisible] = useState(false);
  const isAuth = variant === "auth";
  const isEditorial = variant === "editorial";
  const isSettings = variant === "settings";
  const resolvedAutoComplete =
    autoComplete ?? (isAuth ? "current-password" : "new-password");

  const labelBlockAuthDefault = labelAccessory != null ? (
    <div className="flex items-center justify-between px-1">
      <label
        className={labelClassName ?? (isAuth ? UI_FIELD_LABEL_AUTH_PASSWORD : UI_FIELD_LABEL_DEFAULT)}
        htmlFor={id}
      >
        {label}
      </label>
      {labelAccessory}
    </div>
  ) : (
    <label
      className={labelClassName ?? (isAuth ? UI_FIELD_LABEL_AUTH_PASSWORD : UI_FIELD_LABEL_DEFAULT)}
      htmlFor={id}
    >
      {label}
    </label>
  );

  if (isSettings) {
    const labelClass = labelClassName ?? UI_FIELD_LABEL_SETTINGS;
    const labelClassInline = labelClass.replace(/\bmb-2\s*/, "");
    const showToggle = showVisibilityToggle !== false;
    const labelRow =
      labelAccessory != null ? (
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <label className={labelClassInline} htmlFor={id}>
            {label}
          </label>
          <div className="shrink-0">{labelAccessory}</div>
        </div>
      ) : (
        <label className={labelClass} htmlFor={id}>
          {label}
        </label>
      );

    return (
      <div className="group">
        {labelRow}
        <div className="relative w-full">
          <input
            id={id}
            name={name}
            placeholder={placeholder}
            type={showToggle ? (visible ? "text" : "password") : "password"}
            autoComplete={resolvedAutoComplete}
            {...inputProps}
            className={joinFieldClass("settings-field-input", showToggle && "pr-12", className)}
          />
          {showToggle ? (
            <button
              className="absolute top-1/2 right-4 z-10 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined">
                {visible ? "visibility_off" : "visibility"}
              </span>
            </button>
          ) : null}
        </div>
        {belowInput && labelAccessory == null ? (
          <div className="mt-2 flex justify-end">{belowInput}</div>
        ) : null}
      </div>
    );
  }

  if (isEditorial) {
    const labelClass = labelClassName ?? UI_FIELD_LABEL_EDITORIAL;
    const labelBlock =
      labelAccessory != null ? (
        <div className="flex items-center justify-between px-1">
          <label className={labelClass} htmlFor={id}>
            {label}
          </label>
          {labelAccessory}
        </div>
      ) : (
        <label className={labelClass} htmlFor={id}>
          {label}
        </label>
      );

    const showEditorialToggle = showVisibilityToggle === true;

    return (
      <div className="flex flex-col gap-1">
        {labelBlock}
        <div className="relative">
          <input
            id={id}
            name={name}
            placeholder={placeholder}
            type={showEditorialToggle ? (visible ? "text" : "password") : "password"}
            autoComplete={resolvedAutoComplete}
            {...inputProps}
            className={joinFieldClass(
              "input-editorial w-full",
              showEditorialToggle && "pr-12",
              className,
            )}
          />
          {showEditorialToggle ? (
            <button
              className="absolute top-3 right-4 text-on-surface-variant transition-colors hover:text-on-surface"
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined">
                {visible ? "visibility_off" : "visibility"}
              </span>
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (isAuth) {
    const showToggle = showVisibilityToggle !== false;
    return (
      <div className="space-y-2">
        {labelBlockAuthDefault}
        <div className="relative w-full">
          <input
            id={id}
            name={name}
            placeholder={placeholder}
            type={showToggle ? (visible ? "text" : "password") : "password"}
            autoComplete={resolvedAutoComplete}
            {...inputProps}
            className={joinFieldClass("auth-field-input", showToggle && "pr-12", className)}
          />
          {showToggle ? (
            <button
              className="absolute top-1/2 right-4 z-10 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined text-xl">
                {visible ? "visibility_off" : "visibility"}
              </span>
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {labelBlockAuthDefault}
      <div className="relative w-full">
        <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-xl text-outline">
          lock
        </span>
        <input
          id={id}
          name={name}
          placeholder={placeholder}
          type={visible ? "text" : "password"}
          autoComplete={resolvedAutoComplete}
          {...inputProps}
          className={joinFieldClass("scan-field-input pl-12 pr-12", className)}
        />
        <button
          className="absolute top-1/2 right-4 z-10 -translate-y-1/2 text-outline transition-colors hover:text-on-surface"
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <span className="material-symbols-outlined">
            {visible ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default PasswordField;
