/** High-level API overview for the marketing /api page (not full reference). */

export const API_OVERVIEW_INTRO = {
  title: "Build with ZynQR",
  description:
    "Connect from any app or script using our REST API. Authenticate once, then create and manage QR codes programmatically — same features as the dashboard.",
};

export const API_OVERVIEW_CAPABILITIES = [
  {
    icon: "qr_code_2",
    title: "Dynamic QR codes",
    description:
      "Create short links that redirect through your server. Update destination URL or status without reprinting.",
  },
  {
    icon: "image",
    title: "Static QR codes",
    description:
      "Store encoded payloads for offline-friendly codes — fixed bitmap in the PNG, no server redirect.",
  },
  {
    icon: "analytics",
    title: "Scans & analytics",
    description:
      "Optional per-scan logging with counts, activity feed, and per-QR analytics when analytics is enabled.",
  },
  {
    icon: "key",
    title: "Auth & security",
    description:
      "Email/password and Google OAuth, 2FA, sessions, audit log, and account management from your integration.",
  },
];

export const API_OVERVIEW_STACK = [
  "JSON request/response bodies",
  "Rate limits on auth routes",
  "PostgreSQL + Redis on the backend",
  "Open-source friendly — self-host or use our hosted API",
];
