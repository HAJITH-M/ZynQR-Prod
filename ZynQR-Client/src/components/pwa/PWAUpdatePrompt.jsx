import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "../../utils/toast";

/**
 * Mounts the service worker registration and shows a "new version available" toast with a
 * "Reload" action whenever a fresh build is shipped. Also surfaces a brief "ready offline"
 * toast on the user's first install.
 *
 * vite-plugin-pwa exposes the `virtual:pwa-register/react` hook which handles the lifecycle —
 * we only render UI in response to its callbacks.
 */
export default function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Poll for updates every hour so long-running sessions still pick up new builds.
      if (!registration) return;
      const ONE_HOUR_MS = 60 * 60 * 1000;
      setInterval(() => {
        registration.update().catch(() => {});
      }, ONE_HOUR_MS);
    },
    onRegisterError(error) {
      // eslint-disable-next-line no-console
      console.warn("PWA service worker registration failed:", error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success("ZynQR is ready to work offline.");
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (!needRefresh) return;
    const id = toast("A new version of ZynQR is available.", {
      duration: Infinity,
      action: {
        label: "Reload",
        onClick: () => {
          updateServiceWorker(true);
        },
      },
      onDismiss: () => setNeedRefresh(false),
      onAutoClose: () => setNeedRefresh(false),
    });
    return () => {
      toast.dismiss(id);
    };
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
}
