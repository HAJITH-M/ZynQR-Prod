/** @typedef {{ icon: string; title: string; description: string }} FeatureCard */

/** Hero bento grid — fills row below Print-ready exports (cols 2–3). */
export const BENTO_GRID_CARDS = [
  {
    icon: "qr_code_2",
    title: "Dynamic & Static QRs",
    description:
      "Tracked short links with full analytics, or fixed payloads baked into the image — pick the right type per use case.",
    tags: ["Dynamic", "Static"],
  },
  {
    icon: "code",
    title: "REST API",
    description:
      "Create, update, list, and pull analytics from your own stack. Same power as the dashboard, documented end to end.",
    linkTo: "/api",
    linkLabel: "Explore API docs",
  },
];

/** @type {FeatureCard[]} */
export const EXTRA_FEATURE_CARDS = [
  {
    icon: "qr_code_2",
    title: "Dynamic & static QRs",
    description:
      "Tracked short links with analytics, or fixed payloads baked into the image — choose the right type per campaign.",
  },
  {
    icon: "public",
    title: "Smart redirects",
    description:
      "Inactive or deleted links show a clear message instead of a broken page. Active codes redirect instantly to your URL.",
  },
  {
    icon: "history",
    title: "Activity timeline",
    description:
      "See creates, edits, and scans in one feed. Know what changed and when across your workspace.",
  },
  {
    icon: "shield",
    title: "Account security",
    description:
      "Two-factor email codes, active session management, security audit log, and password controls — built into the dashboard.",
  },
  {
    icon: "download",
    title: "Export your codes",
    description:
      "Download QR images as PNG, SVG, or EPS from the dashboard so print and design workflows stay simple.",
  },
  {
    icon: "code",
    title: "REST API",
    description:
      "Automate create, update, list, and analytics from your own app. Same capabilities as the UI, documented in the dashboard.",
  },
];

/** @type {{ step: string; title: string; description: string }[]} */
export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Create",
    description: "Name your QR, set a destination (dynamic) or payload (static), and download the image.",
  },
  {
    step: "02",
    title: "Share",
    description: "Print, email, or embed — dynamic codes use a short link that never changes on the sticker.",
  },
  {
    step: "03",
    title: "Measure",
    description: "Watch scans roll in with location, device, and browser insights on Global Analytics.",
  },
];

/** @type {{ icon: string; title: string; description: string }[]} */
export const USE_CASE_IDEAS = [
  {
    icon: "restaurant",
    title: "Menus & retail",
    description: "Swap menu URLs seasonally without reprinting table tents.",
  },
  {
    icon: "campaign",
    title: "Marketing campaigns",
    description: "One QR on a poster; A/B destinations by updating the link in seconds.",
  },
  {
    icon: "event",
    title: "Events & tickets",
    description: "Point attendees to schedules, registration, or live updates during the event.",
  },
  {
    icon: "wifi",
    title: "Wi‑Fi & onboarding",
    description: "Static codes for fixed credentials; dynamic codes when access details change.",
  },
];
