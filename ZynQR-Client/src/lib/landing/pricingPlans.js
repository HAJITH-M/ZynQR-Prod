/** @typedef {{ label: string; included: boolean }} PricingFeature */

/** @typedef {{
 *   id: string;
 *   badge?: string;
 *   tierLabel: string;
 *   priceDisplay: string;
 *   priceSuffix?: string;
 *   tagline?: string;
 *   highlighted?: boolean;
 *   features: PricingFeature[];
 *   cta: { label: string; to?: string; variant: "primary" | "outline" | "button" };
 *   secondaryCta?: { label: string; to?: string };
 * }} PricingPlan */

/** Single free tier — all product features included. */
/** @type {PricingPlan} */
export const LANDING_FREE_PLAN = {
  id: "free",
  tierLabel: "ZynQR Free",
  priceDisplay: "Free",
  tagline: "Everything included. No credit card. No limits on core features.",
  features: [
    { label: "Unlimited dynamic QR codes", included: true },
    { label: "Static QR codes (direct payload)", included: true },
    { label: "Analytics & per-scan history", included: true },
    { label: "Approximate geolocation on scans", included: true },
    { label: "Edit destination & status anytime", included: true },
    { label: "API access & public /qr links", included: true },
    { label: "Dashboard, security & activity log", included: true },
  ],
  cta: { label: "Get started free", to: "/register", variant: "primary" },
  highlighted: true,
};

/** @type {PricingPlan} */
export const LANDING_DEVELOPER_PLAN = {
  id: "developer",
  badge: "For builders",
  tierLabel: "API & open source",
  priceDisplay: "Build your own",
  tagline: "Create and manage QRs from your app, scripts, or self-hosted stack.",
  features: [
    { label: "REST API — dynamic & static QR codes", included: true },
    { label: "Programmatic create, update, delete & analytics", included: true },
    { label: "Public /rq/:id redirects & scan logging", included: true },
    { label: "Bearer tokens, refresh cookies & rate limits", included: true },
    { label: "Open source — inspect, fork, and extend", included: true },
    { label: "Docs, curl examples & JSON/Markdown export", included: true },
  ],
  cta: { label: "Explore the API", to: "/api", variant: "outline" },
  secondaryCta: { label: "Full API reference", to: "/dashboard/api-docs" },
};
