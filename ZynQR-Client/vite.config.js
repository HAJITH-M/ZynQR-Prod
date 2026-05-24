import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    VitePWA({
      // Generates a service worker that ships a fresh build to every user without prompting
      // for a reload — combined with the `useRegisterSW` prompt below, users get a toast.
      registerType: "prompt",
      // Inject the SW registration script into index.html for us.
      injectRegister: "auto",
      // Auto-clean stale dev SW between hot reloads (no surprises during development).
      devOptions: { enabled: false },
      includeAssets: ["Logo.png", "robots.txt"],
      manifest: {
        name: "ZynQR — Dynamic QR Code Management",
        short_name: "ZynQR",
        description:
          "Create dynamic and static QR codes, track scans, and manage everything in one workspace.",
        theme_color: "#af3100",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "en",
        categories: ["productivity", "business", "utilities"],
        icons: [
          {
            src: "/Logo.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/Logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/Logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache the app shell — HTML, JS, CSS, SVG, fonts, images.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webp,woff,woff2}"],
        cleanupOutdatedCaches: true,
        // SPA routing: serve index.html for unknown navigation requests offline.
        navigateFallback: "/index.html",
        // Don't try to serve index.html for redirect/short-link API paths or static assets.
        navigateFallbackDenylist: [/^\/api\//, /^\/qr\/[^/]+$/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            // Google Fonts CSS — stale-while-revalidate so updates apply on the next visit.
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
            },
          },
          {
            // Google Fonts font files — cache-first with a long expiry.
            urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            // App images served from the same origin (dashboard charts, hero assets, …).
            urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "zynqr-images",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 days
            },
          },
          {
            // Never cache API responses — auth + analytics must always hit the network.
            urlPattern: /\/api\//,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
  build: {
    outDir: "dist",
  },
  server: {
    port: 5178,
  },
});
