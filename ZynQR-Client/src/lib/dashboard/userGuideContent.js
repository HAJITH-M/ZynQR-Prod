/**
 * @typedef {{ label: string; to: string }} UserGuideLink
 * @typedef {{ text: string; link?: UserGuideLink }} UserGuideListItem
 * @typedef {{
 *   id: string;
 *   title: string;
 *   icon: string;
 *   summary: string;
 *   paragraphs?: string[];
 *   bullets?: UserGuideListItem[];
 *   tips?: { title: string; body: string }[];
 *   relatedLinks?: UserGuideLink[];
 * }} UserGuideSection
 */

/** @type {UserGuideSection[]} */
export const USER_GUIDE_SECTIONS = [
  {
    id: "getting-started",
    title: "Getting started",
    icon: "rocket_launch",
    summary: "Create an account, sign in, and orient yourself in the workspace.",
    paragraphs: [
      "ZynQR lets you create dynamic QR codes (tracked short links with analytics) and static QR codes (data baked directly into the image). After you sign in, the dashboard is your home base for scans, activity, and account settings.",
    ],
    bullets: [
      { text: "Register at /register with your email and a strong password, or sign in at /login if you already have an account." },
      { text: "Forgot your password? Use /forgot-password to request a reset link, then set a new password from the email flow." },
      { text: "The workspace dashboard (/dashboard) shows scan totals, active QR count, a recent-activity preview, and quick actions to generate a new code. Open Global Analytics for the full summary cards (including conversion rate) explained in the Analytics section of this guide." },
      { text: "Use the sidebar to move between Dashboard, My QRs, Recent Activity, Analytics, User Guide, and Settings (Profile + Privacy & security)." },
    ],
    relatedLinks: [
      { label: "Register", to: "/register" },
      { label: "Sign in", to: "/login" },
      { label: "Dashboard", to: "/dashboard" },
    ],
  },
  {
    id: "dynamic-vs-static",
    title: "Dynamic vs static QR codes",
    icon: "compare_arrows",
    summary: "Choose the right QR type for your use case.",
    paragraphs: [
      "Dynamic QRs point to a ZynQR short link (for example /qr/your-id). When someone scans, we redirect to your destination URL and can record scans, status, and activity. You can change the destination later without reprinting.",
      "Static QRs encode the payload directly in the PNG. Scanners read that exact string—there is no hosted redirect and no scan pipeline on our servers. Use static codes when the content never changes and you do not need analytics.",
    ],
    bullets: [
      { text: "Dynamic — best for campaigns, menus, landing pages that change, and anything you want to measure.", link: { label: "Create dynamic QR", to: "/dashboard/create" } },
      { text: "Static — best for fixed Wi‑Fi credentials, permanent URLs, or vCard text encoded once.", link: { label: "Create static QR", to: "/dashboard/create-static-qr" } },
      { text: "From the dashboard, open Generate Code to compare both options side by side before you choose." },
    ],
    tips: [
      {
        title: "Quick rule",
        body: "If you might change the link or want scan counts → dynamic. If the encoded text is final and tracking does not matter → static.",
      },
    ],
  },
  {
    id: "create-dynamic",
    title: "Creating a dynamic QR",
    icon: "add_circle",
    summary: "Name your code, set a destination URL, and optional analytics.",
    paragraphs: [
      "Go to Create QR (/dashboard/create) or use Generate Code → Create dynamic QR on the dashboard.",
    ],
    bullets: [
      { text: "QR name — a label you will see in My QRs and breadcrumbs (required)." },
      { text: "Destination URL — where scanners are sent after the short link (required). Use a full URL including https://." },
      { text: "Analytics — when enabled, scans contribute to counts and appear in activity and analytics views." },
      { text: "After save, you are taken to My QRs. Each row shows short link, destination, scan count, status, and actions." },
      { text: "Public scans use your short link path /qr/<id> (printed on the code). Updating the destination in the dashboard does not change the printed QR image." },
    ],
    relatedLinks: [
      { label: "Create dynamic QR", to: "/dashboard/create" },
      { label: "My QRs", to: "/dashboard/my-qrs" },
    ],
  },
  {
    id: "create-static",
    title: "Creating a static QR",
    icon: "image",
    summary: "Encode a payload directly into a downloadable PNG.",
    paragraphs: [
      "Open Create static QR (/dashboard/create-static-qr). Enter a name and the payload (URL or text) to embed. The server returns a PNG data URL you can download or copy from the static list.",
    ],
    bullets: [
      { text: "Name — for your own organization in the static tab of My QRs." },
      { text: "Encoded payload — the exact string embedded in the QR (often a URL)." },
      { text: "Static codes do not appear in global scan analytics or the scan activity feed." },
      { text: "Manage static codes under My QRs → Static tab, or visit /dashboard/static-qrs for the full list." },
    ],
    relatedLinks: [
      { label: "Create static QR", to: "/dashboard/create-static-qr" },
      { label: "Static QR list", to: "/dashboard/static-qrs" },
    ],
  },
  {
    id: "manage-qrs",
    title: "Managing your QR codes",
    icon: "qr_code_2",
    summary: "Search, edit, preview, export, and delete codes.",
    paragraphs: [
      "My QRs (/dashboard/my-qrs) has Dynamic and Static tabs. Use the search box to filter by name, short link, or destination.",
    ],
    bullets: [
      { text: "Edit — change name, destination URL, or analytics flag for a dynamic QR (/dashboard/my-qrs/:id/edit)." },
      { text: "Analytics — open per-QR stats from the row menu (/dashboard/my-qrs/:id/analytics)." },
      { text: "Preview — view the QR image in a modal; download PNG when export is available." },
      { text: "Delete — confirm in the dialog; deletion is permanent for that code." },
      { text: "Pagination — lists show 10 items per page with first/prev/next/last controls." },
    ],
    relatedLinks: [{ label: "My QRs", to: "/dashboard/my-qrs" }],
  },
  {
    id: "analytics",
    title: "Analytics & insights",
    icon: "analytics",
    summary: "Workspace-wide and per-code performance.",
    paragraphs: [
      "Global Analytics (/dashboard/analytics) opens with three summary cards at the top, then growth charts, geographic-style reach, device and browser breakdowns, a top-QR table, and a paginated scan log.",
      "Those three cards are loaded together from the same server summary so the numbers stay in sync—no manual math in the browser.",
    ],
    bullets: [
      {
        text: "Total aggregate scans — the sum of every scan recorded on your dynamic QRs (each successful short-link redirect with analytics enabled adds one to that QR’s count, and this card adds them all up).",
      },
      {
        text: "Conversion rate — shown as a single number (for example 3.8). This is not “purchases ÷ scans” or another off-site marketing conversion; ZynQR only sees the scan and redirect, not what visitors do on your destination website.",
      },
      {
        text: "Why we call it conversion rate — it measures how well your QR portfolio converts attention into scans on average: total aggregate scans ÷ number of dynamic QRs. Example: 15 scans across 4 codes → 15 ÷ 4 = 3.8 average scans per QR. The subtitle also shows how many codes have at least one scan (e.g. “3 of 4 have scans”).",
      },
      {
        text: "Active QR codes — how many dynamic QRs are set to active right now, out of your total count. Inactive codes still exist but do not accept new redirects until you turn them back on.",
      },
      { text: "Dashboard overview — uses the same scan and active-QR ideas in a smaller preview on the home page." },
      { text: "Growth chart — switch period (daily, weekly, monthly) to see scan trends over time." },
      { text: "Top QR codes by scans — ranked list with each code’s share of total scans (% of all scans that came from that QR)." },
      { text: "Scan log — one row per logged scan with time and location or device details when available." },
      { text: "Per-QR analytics — drill down from My QRs for a single code’s scans, frequency chart, and details." },
    ],
    tips: [
      {
        title: "Reading conversion rate fairly",
        body: "A low average can mean many codes were never scanned yet, not that campaigns failed. Compare active codes, use the “X of Y have scans” line, and open per-QR analytics to see which codes pull weight.",
      },
      {
        title: "Not the same as website conversion",
        body: "To track sign-ups or sales on your own site, use your landing-page analytics (UTM tags, Google Analytics, etc.) on the destination URL. ZynQR’s conversion rate only describes scan volume across your QR codes.",
      },
    ],
    relatedLinks: [
      { label: "Global Analytics", to: "/dashboard/analytics" },
      { label: "Dashboard", to: "/dashboard" },
    ],
  },
  {
    id: "activity",
    title: "Recent activity",
    icon: "history",
    summary: "Audit trail of creates, edits, scans, and account events.",
    paragraphs: [
      "Recent Activity (/dashboard/recent-activity) lists events across your workspace—QR created or updated, scans, and related actions. The dashboard home page shows the latest five with a link to view all.",
    ],
    bullets: [
      { text: "Each row shows what happened, which QR (if any), and a relative timestamp." },
      { text: "If activity fails to load, use Retry on the dashboard or activity page." },
      { text: "Scan events also feed into Global Analytics when analytics is enabled on the QR." },
    ],
    relatedLinks: [{ label: "Recent Activity", to: "/dashboard/recent-activity" }],
  },
  {
    id: "profile",
    title: "Profile & password",
    icon: "person",
    summary: "Display name, email, and password under Settings → Profile.",
    paragraphs: [
      "Account settings live at /dashboard/account. Your email is read-only; update your display name and password from this page.",
    ],
    bullets: [
      { text: "Display name — 3–100 characters; shown in the header avatar initial and account link." },
      { text: "Save profile — updates your display name across the dashboard." },
      { text: "Change password — current password plus new + confirm; requirements: 8+ characters, one digit, one special character, and matching confirmation." },
      { text: "Two-factor authentication — enable or manage from Privacy & security; the profile page links you there when 2FA is off." },
    ],
    relatedLinks: [{ label: "Profile", to: "/dashboard/account" }],
  },
  {
    id: "privacy-security",
    title: "Privacy & security",
    icon: "shield",
    summary: "2FA, sessions, audit log, and account deletion.",
    paragraphs: [
      "Privacy & security (/dashboard/security) centralizes protection controls for your ZynQR account.",
    ],
    bullets: [
      { text: "Two-factor authentication (2FA) — toggle on or off; when enabled, sign-in may require an additional verification step depending on your backend setup." },
      { text: "Active sessions — see devices and browsers; revoke individual sessions or log out everywhere except careful review of the current session." },
      { text: "Security audit log — paginated history (login, logout, password changes, session revoke, etc.) with filters." },
      { text: "Delete account — permanent; type the confirmation phrase in the modal. You will be signed out and must register again to use ZynQR." },
    ],
    tips: [
      {
        title: "Stay secure",
        body: "Revoke sessions you do not recognize immediately and enable 2FA before storing sensitive campaign links.",
      },
    ],
    relatedLinks: [{ label: "Privacy & security", to: "/dashboard/security" }],
  },
  {
    id: "header-account",
    title: "Header & navigation",
    icon: "menu",
    summary: "Breadcrumbs, mobile menu, and profile access.",
    paragraphs: [
      "The top bar works across dashboard pages on desktop and mobile.",
    ],
    bullets: [
      { text: "Menu (mobile) — opens the same sidebar as desktop for navigation." },
      { text: "ZynQR logo — returns to the marketing home; scrolls to top if you are already on /." },
      { text: "Breadcrumbs — show your place (e.g. Dashboard → My QRs → Edit · Campaign Name)." },
      { text: "Profile circle — first letter of your display name; opens Profile settings." },
      { text: "Help icon — opens this User Guide." },
    ],
    relatedLinks: [{ label: "User Guide", to: "/dashboard/guide" }],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting & FAQ",
    icon: "help",
    summary: "Common issues and what to try first.",
    bullets: [
      { text: "Cannot create QR — confirm you are signed in and your session email is stored; sign out and back in if requests fail with auth errors." },
      { text: "Scans not increasing — ensure the QR is dynamic, analytics is enabled, and scanners use the /qr/ short link not an old printed destination." },
      { text: "Activity empty — create or edit a QR, or perform a test scan on the public link; allow a moment for the API to refresh." },
      { text: "Password change rejected — check all security requirements and that current password is correct." },
      { text: "Display name not saving — use 3–100 characters; fix validation messages shown under the field." },
      { text: "Static QR wrong content — edit requires creating a new static code; the payload is fixed in the image." },
    ],
    tips: [
      {
        title: "Still stuck?",
        body: "Note the page URL, the action you tried, and any error toast text—support can use that to trace API failures faster.",
      },
    ],
  },
];

export const USER_GUIDE_INTRO = {
  title: "ZynQR User Guide",
  subtitle:
    "Everything you need to create QR codes, read analytics, and manage your account—in one place.",
  updated: "May 2026",
};
