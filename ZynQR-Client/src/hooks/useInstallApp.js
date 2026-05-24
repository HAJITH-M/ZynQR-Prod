import { useEffect, useState } from "react";
import {
  getDeferredPrompt,
  isIOSDevice,
  isStandaloneDisplay,
  subscribeInstallPrompt,
  triggerInstall,
} from "../lib/pwa/installManager";

/**
 * React hook around `installManager`. Re-renders when the deferred prompt becomes available
 * (so the sidebar can show/hide the Install button) and exposes a `promptInstall()` action.
 *
 * Returns:
 *   - `canInstall`  — true when the button should be shown (deferred prompt OR iOS, and not yet installed)
 *   - `isIOS`       — true on iOS Safari (no native prompt; caller renders "Add to Home Screen" hints)
 *   - `isInstalled` — true when the app is already running in standalone mode
 *   - `promptInstall()` — async; returns "prompted" | "ios-instructions" | "unsupported"
 */
export function useInstallApp() {
  const [hasPrompt, setHasPrompt] = useState(() => Boolean(getDeferredPrompt()));
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneDisplay());

  useEffect(() => {
    const unsubscribe = subscribeInstallPrompt(() => {
      setHasPrompt(Boolean(getDeferredPrompt()));
      setIsInstalled(isStandaloneDisplay());
    });

    const media = window.matchMedia?.("(display-mode: standalone)");
    const onChange = () => setIsInstalled(isStandaloneDisplay());
    media?.addEventListener?.("change", onChange);

    return () => {
      unsubscribe();
      media?.removeEventListener?.("change", onChange);
    };
  }, []);

  const isIOS = isIOSDevice();
  const canInstall = !isInstalled && (hasPrompt || isIOS);

  return { canInstall, isIOS, isInstalled, promptInstall: triggerInstall };
}
