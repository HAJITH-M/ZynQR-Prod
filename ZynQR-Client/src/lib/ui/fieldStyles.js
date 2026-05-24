export const UI_FIELD_LABEL_DEFAULT =
  "font-label ml-1 block text-sm font-semibold text-on-surface";

export const UI_FIELD_LABEL_AUTH =
  "font-label ml-1 block text-xs font-bold uppercase tracking-widest text-on-surface-variant";

export const UI_FIELD_LABEL_AUTH_PASSWORD =
  "font-label block text-xs font-bold uppercase tracking-widest text-on-surface-variant";

export const UI_FIELD_LABEL_EDITORIAL =
  "font-label block text-xs font-bold uppercase tracking-widest text-on-surface-variant/70";

export const UI_FIELD_LABEL_SETTINGS =
  "font-headline mb-2 block text-sm font-bold text-on-surface";

export const UI_OTP_CELL_CLASS =
  "h-14 w-12 rounded-t-lg border-b-2 border-outline-variant bg-surface-container-low text-center text-xl font-bold outline-none focus:border-primary";

/** @param  {...(string | false | null | undefined)} parts */
export function joinFieldClass(...parts) {
  return parts.filter(Boolean).join(" ");
}
