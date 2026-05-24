/**
 * Captures the browser's `beforeinstallprompt` event the moment it fires so we can re-fire it
 * from a custom "Install app" button later. Also tracks the installed state via `appinstalled`
 * and `display-mode: standalone`.
 *
 * The listeners register at module evaluation, so just *importing* this file once anywhere in
 * the app bootstrap (we do so from `main.jsx`) is enough to capture the event before the user
 * navigates into the dashboard.
 */

let deferredPrompt = null;
const subscribers = new Set();

function notify() {
  for (const fn of subscribers) {
    try {
      fn();
    } catch {
      // Subscriber errors must never break the install flow.
    }
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

export function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  const standaloneMedia = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = window.navigator?.standalone === true;
  return Boolean(standaloneMedia || iosStandalone);
}

export function isIOSDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIos = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isMacWithTouch = /Macintosh/.test(ua) && typeof document !== "undefined" && "ontouchend" in document;
  return isIos || isMacWithTouch;
}

export function getDeferredPrompt() {
  return deferredPrompt;
}

export function subscribeInstallPrompt(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/**
 * Prompt the user to install the PWA. Returns one of:
 *   "prompted"          — a native prompt was shown (we don't expose the outcome)
 *   "ios-instructions"  — no native prompt available, caller should show iOS steps
 *   "unsupported"       — browser doesn't support installation at all
 */
export async function triggerInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } catch {
      // We don't surface the user's decision — they can re-click the button to try again.
    }
    deferredPrompt = null;
    notify();
    return "prompted";
  }
  if (isIOSDevice()) return "ios-instructions";
  return "unsupported";
}
