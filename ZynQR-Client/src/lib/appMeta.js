/**
 * App metadata derived at build time.
 *
 * `__APP_VERSION__` is injected by Vite (see vite.config.js `define`) from the
 * "version" field in package.json, so this stays in sync with releases.
 */
export const APP_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.0.0";

/** Convenience label like "v1.0.0" for display in the UI. */
export const APP_VERSION_LABEL = `v${APP_VERSION}`;
