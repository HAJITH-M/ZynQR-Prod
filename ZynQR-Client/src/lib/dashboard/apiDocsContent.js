/** @typedef {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} HttpMethod */

/**
 * @typedef {{
 *   id: string;
 *   method: HttpMethod;
 *   path: string;
 *   auth: boolean;
 *   summary: string;
 *   why: string;
 *   body?: string;
 *   query?: string;
 *   response?: string;
 *   frontend?: string;
 *   rateLimit?: string;
 * }} ApiEndpoint
 */

/**
 * @typedef {{ title: string; code: string }} ApiCodeExample
 */

/**
 * @typedef {{
 *   id: string;
 *   title: string;
 *   icon: string;
 *   summary: string;
 *   paragraphs?: string[];
 *   bullets?: string[];
 *   code?: string;
 *   codeExamples?: ApiCodeExample[];
 *   endpoints?: ApiEndpoint[];
 * }} ApiDocSection
 */

export const API_DOCS_INTRO = {
  title: "API Documentation",
  subtitle:
    "REST API reference for ZynQR — authentication, dynamic QR codes, static QRs, analytics, and how the React app calls each endpoint.",
  basePath: "/api/v1",
  updated: "May 2026",
};

export const API_ENV_VARS = [
  {
    name: "VITE_API_URL",
    where: "code-generator/.env",
    example: "http://localhost:8000/api/v1",
    why: "Axios base URL for all dashboard API calls.",
  },
  {
    name: "VITE_PUBLIC_APP_URL",
    where: "code-generator/.env (optional)",
    example: "http://localhost:5173",
    why: "Public origin for /qr/:id scan links shown in the UI (falls back to API host without /api/v1).",
  },
  {
    name: "VITE_GITHUB_REPO_URL",
    where: "code-generator/.env",
    example: "https://github.com/your-org/zynqr",
    why: "Repository root for the GitHub link in API Docs (no trailing slash).",
  },
  {
    name: "PORT",
    where: "ZynQR-Server/.env",
    example: "8000",
    why: "Go server listen port.",
  },
  {
    name: "DB_* / REDIS_*",
    where: "ZynQR-Server/.env",
    example: "PostgreSQL + Redis for sessions and rate limits.",
    why: "Persistence and session store for JWT refresh flow.",
  },
  {
    name: "JWT_SECRET / JWT_REFRESH_SECRET",
    where: "ZynQR-Server/.env",
    why: "Sign access tokens (Bearer) and refresh tokens (httpOnly cookie).",
  },
  {
    name: "CLIENT_ID / CLIENT_SECRET / REDIRECT_URL",
    where: "ZynQR-Server/.env",
    why: "Google OAuth credentials and the backend callback URL registered in Google Cloud Console.",
  },
  {
    name: "FRONTEND_URL",
    where: "ZynQR-Server/.env",
    example: "http://localhost:5173",
    why: "Origin of the React app — the Google callback redirects users here (to /oauth/callback) after success or failure.",
  },
  {
    name: "SMTP_*",
    where: "ZynQR-Server/.env",
    why: "Verification and forgot-password emails.",
  },
];

export const API_FRONTEND_CLIENTS = [
  { file: "src/api/axiosInstance.js", role: "Shared Axios client, Bearer token, refresh-on-401, cookies." },
  { file: "src/api/auth.api.js", role: "Register, login, 2FA, profile, sessions, audit log, account delete." },
  { file: "src/api/qr.api.js", role: "Dynamic QR CRUD, activity, growth analytics, per-QR scans." },
  { file: "src/api/staticQr.api.js", role: "Static QR create, list, delete." },
  {
    file: "src/components/auth/GoogleOAuthButton.jsx",
    role: "Top-level navigation button that starts the Google OAuth flow (GET /auth/google).",
  },
  {
    file: "src/pages/oauth/OAuthCallback.jsx",
    role: "Consumes the post-callback redirect: stores access_token, scrubs URL params, navigates to /dashboard.",
  },
];

/** Root GitHub repo URL (no trailing slash), from VITE_GITHUB_REPO_URL. */
export const API_GITHUB_REPO_ROOT =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_GITHUB_REPO_URL
    ? String(import.meta.env.VITE_GITHUB_REPO_URL).replace(/\/$/, "")
    : "";

/** Resolved GitHub link for API Docs buttons (env var or documented example). */
export const API_GITHUB_LINK = API_GITHUB_REPO_ROOT || "https://github.com/Hajith-M/zynqr";

export const API_CODEBASE_REPOS = [
  {
    name: "Frontend (React + Vite)",
    path: "code-generator/",
    stack: "React 19, Vite, TanStack Query, Axios, React Router, Tailwind CSS 4",
  },
  {
    name: "Backend (Go + Gin)",
    path: "code-generator-backend/ZynQR-Server/",
    stack: "Gin, PostgreSQL, Redis, JWT, Google OAuth, SMTP",
  },
];

/** @type {ApiEndpoint[]} */
export const API_ENDPOINTS = [
  {
    id: "auth-register",
    method: "POST",
    path: "/auth/register",
    auth: false,
    summary: "Create account with email and password.",
    why: "Onboarding; sends verification email when SMTP is configured.",
    body: '{ "email", "password", "display_name?" }',
    response: "201 — user created; may include verification instructions.",
    frontend: "auth.api.js → registerUser()",
    rateLimit: "6 req/min per IP (login group)",
  },
  {
    id: "auth-login",
    method: "POST",
    path: "/auth/login",
    auth: false,
    summary: "Email/password login.",
    why: "Returns access_token or two_factor_ticket when 2FA is enabled.",
    body: '{ "email", "password" }',
    response: '{ "access_token" } or { "two_factor_ticket", "requires_2fa": true }',
    frontend: "auth.api.js → loginUser(), verifyLogin2FA()",
    rateLimit: "6 req/min per IP",
  },
  {
    id: "auth-refresh",
    method: "POST",
    path: "/auth/refresh",
    auth: false,
    summary: "Rotate access token using httpOnly refresh cookie.",
    why: "Called automatically by axiosInstance on 401 (except login/password routes).",
    response: '{ "access_token" }',
    frontend: "axiosInstance.js (interceptor)",
    rateLimit: "6 req/min per IP",
  },
  {
    id: "auth-me-get",
    method: "GET",
    path: "/auth/me",
    auth: true,
    summary: "Current user profile.",
    why: "Header avatar, account page, 2FA toggle state.",
    response: '{ "user_id", "email", "display_name", "two_factor_enabled", ... }',
    frontend: "auth.api.js → fetchAuthMe()",
  },
  {
    id: "auth-me-patch",
    method: "PATCH",
    path: "/auth/me",
    auth: true,
    summary: "Update display name (3–100 chars).",
    why: "Profile settings without changing email.",
    body: '{ "display_name": "..." }',
    frontend: "auth.api.js → patchAuthMe()",
  },
  {
    id: "auth-2fa",
    method: "PATCH",
    path: "/auth/two-factor",
    auth: true,
    summary: "Enable or disable two-factor authentication.",
    body: '{ "enabled": true | false }',
    frontend: "auth.api.js → updateTwoFactor()",
  },
  {
    id: "auth-change-password",
    method: "POST",
    path: "/auth/change-password",
    auth: true,
    summary: "Change password while logged in.",
    body: '{ "current_password", "new_password" }',
    frontend: "auth.api.js → changePassword()",
  },
  {
    id: "auth-forgot",
    method: "POST",
    path: "/auth/forgot-password",
    auth: false,
    summary: "Request password-reset OTP email.",
    body: '{ "email" }',
    frontend: "auth.api.js → forgotPassword(), verifyForgotPasswordOtp(), updateForgotPassword()",
  },
  {
    id: "auth-sessions",
    method: "GET",
    path: "/auth/sessions",
    auth: true,
    summary: "List active sessions (device, IP, user agent).",
    frontend: "auth.api.js → fetchAuthSessions(), revokeAuthSession()",
  },
  {
    id: "auth-audit",
    method: "GET",
    path: "/auth/security-audit-log",
    auth: true,
    summary: "Security audit events (login, logout, password change, …).",
    frontend: "auth.api.js → fetchSecurityAuditLog()",
  },
  {
    id: "auth-delete",
    method: "POST",
    path: "/auth/delete-account",
    auth: true,
    summary: "Permanently delete account and related data.",
    body: '{ "confirmation": "delete" }',
    frontend: "auth.api.js → deleteAccount()",
  },
  {
    id: "auth-google",
    method: "GET",
    path: "/auth/google",
    auth: false,
    summary: "Start the Google OAuth consent redirect.",
    why: "Top-level browser navigation (not XHR). 302s to Google with offline + force consent so a refresh token is returned.",
    response: "302 → accounts.google.com/o/oauth2/auth?…",
    frontend: "components/auth/GoogleOAuthButton.jsx (anchor link to VITE_API_URL + /auth/google)",
  },
  {
    id: "auth-google-callback",
    method: "GET",
    path: "/auth/google/callback",
    auth: false,
    summary: "Google OAuth callback — exchanges the code, links/creates the user, sets the refresh cookie, redirects to the SPA.",
    why: "Auto-links Google to an existing email/password account so the user can sign in either way. Display name is only filled on first sign-in — never overwritten on later sign-ins.",
    query: "?code=...&state=...   (or ?error=... when the user cancels)",
    response:
      "302 → FRONTEND_URL/oauth/callback?provider=google&access_token=…&user_id=…&email=…&display_name=…\\n302 → FRONTEND_URL/oauth/callback?provider=google&error=<code> on failure (invalid_credentials, email_not_verified, account_not_active, change_password_required, token_exchange_failed, userinfo_*, code_missing, access_denied).",
    frontend: "pages/oauth/OAuthCallback.jsx",
  },
  {
    id: "qr-list",
    method: "GET",
    path: "/qr/get",
    auth: true,
    summary: "List all dynamic QRs for the logged-in user.",
    response: '{ "qrs": [ { "ID", "QrName", "DestinationURL", "scan_count", "Status", ... } ] }',
    frontend: "qr.api.js → fetchQrListRaw() / listNormalizedQrRows()",
  },
  {
    id: "qr-create",
    method: "POST",
    path: "/qr/create",
    auth: true,
    summary: "Create a dynamic QR (short link + optional analytics).",
    why: "Generates /qr/:id redirect; scan events when analytics_enabled is true.",
    body: '{ "email", "qr_name", "destination_url", "analytics_enabled?" }',
    frontend: "qr.api.js → createQr()",
    rateLimit: "120 writes/min per IP",
  },
  {
    id: "qr-update",
    method: "PUT",
    path: "/qr/update/:id",
    auth: true,
    summary: "Update name, destination, status, or analytics flag.",
    body: '{ "qr_name?", "destination_url?", "status?", "analytics_enabled?" }',
    frontend: "qr.api.js → updateQr()",
    rateLimit: "120 writes/min per IP",
  },
  {
    id: "qr-delete",
    method: "DELETE",
    path: "/qr/delete",
    auth: true,
    summary: "Delete a dynamic QR.",
    body: '{ "qr_id": "uuid" }',
    frontend: "qr.api.js → deleteQr()",
    rateLimit: "120 writes/min per IP",
  },
  {
    id: "qr-activity",
    method: "GET",
    path: "/qr/activity",
    auth: true,
    summary: "Workspace activity feed (created, updated, scans).",
    query: "?limit=100&event_type=scan (optional)",
    frontend: "qr.api.js → fetchQrActivity()",
  },
  {
    id: "qr-scans",
    method: "GET",
    path: "/qr/scans/:id",
    auth: true,
    summary: "Per-QR scan log rows.",
    query: "?limit=50",
    frontend: "qr.api.js → fetchQrScans()",
  },
  {
    id: "qr-analytics-summary",
    method: "GET",
    path: "/qr/analytics/summary",
    auth: true,
    summary: "Global analytics summary cards (total scans, conversion rate, active QRs).",
    response:
      '{ "summary": { "total_aggregate_scans", "total_qr_count", "active_qr_count", "conversion_rate", "qrs_with_scans", "scan_sample": { "sample_size", "has_user_agent", "device_share": { "mobile_pct", "desktop_pct", "tablet_pct" }, "top_browsers": [{ "label", "pct" }] } } }',
    frontend: "qr.api.js → fetchQrAnalyticsSummary()",
  },
  {
    id: "qr-growth",
    method: "GET",
    path: "/qr/analytics/growth",
    auth: true,
    summary: "Global scan growth buckets.",
    query: "?period=daily|weekly|monthly",
    frontend: "qr.api.js → fetchQrGrowth()",
  },
  {
    id: "qr-frequency",
    method: "GET",
    path: "/qr/analytics/scan-frequency/:id",
    auth: true,
    summary: "Per-QR scan frequency chart.",
    query: "?window=7d|30d|90d",
    frontend: "qr.api.js → fetchQrScanFrequency()",
  },
  {
    id: "static-list",
    method: "GET",
    path: "/static-qr/list",
    auth: true,
    summary: "List static QRs (PNG payload stored server-side).",
    frontend: "staticQr.api.js → fetchStaticQrList()",
  },
  {
    id: "static-create",
    method: "POST",
    path: "/static-qr/create",
    auth: true,
    summary: "Create static QR (data encoded in image only).",
    body: '{ "name", "encoded_payload" }',
    why: "No /qr redirect or scan pipeline — offline-friendly fixed payload.",
    frontend: "staticQr.api.js → createStaticQr()",
    rateLimit: "120 writes/min per IP",
  },
  {
    id: "static-delete",
    method: "DELETE",
    path: "/static-qr/:id",
    auth: true,
    summary: "Delete a static QR.",
    frontend: "staticQr.api.js → deleteStaticQr()",
    rateLimit: "120 writes/min per IP",
  },
  {
    id: "public-redirect",
    method: "GET",
    path: "/qr/:id",
    auth: false,
    summary: "Public scan redirect (not under /api/v1).",
    why: "Printed on dynamic QR codes; records scan when analytics enabled.",
    response: "302 → destination_url",
  },
];

/** @type {ApiDocSection[]} */
export const API_DOC_SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    icon: "hub",
    summary: "REST JSON API served by the Go backend; consumed by the React dashboard.",
    paragraphs: [
      "All authenticated dashboard routes live under /api/v1. The browser stores the access token in localStorage (key: token) and sends Authorization: Bearer <token>. Refresh tokens use an httpOnly cookie on POST /auth/refresh.",
      "Dynamic QR scans hit GET /qr/:id on the same host as the API (or VITE_PUBLIC_APP_URL in the UI). Static QRs never use this redirect — payload is only in the PNG.",
    ],
    bullets: [
      "Content-Type: application/json for request and response bodies.",
      "Errors: { \"error\": \"message\" } with appropriate HTTP status (400, 401, 429, 500).",
      "429 responses are surfaced via toast in the React app (axios response interceptor).",
    ],
  },
  {
    id: "configuration",
    title: "Configuration",
    icon: "settings",
    summary: "Environment variables for local and production setups.",
    paragraphs: [
      "Copy ZynQR-Server/.env.example to .env and set database, Redis, JWT, OAuth, and SMTP. In the frontend, create code-generator/.env with VITE_API_URL pointing at your API base including /api/v1.",
    ],
    code: `# Frontend (code-generator/.env)
VITE_API_URL=http://localhost:8000/api/v1
VITE_PUBLIC_APP_URL=http://localhost:5173

# Backend — see ZynQR-Server/.env.example
PORT=8000
DB_HOST=localhost
JWT_SECRET=...
JWT_REFRESH_SECRET=...`,
  },
  {
    id: "authentication",
    title: "Authentication flow",
    icon: "key",
    summary: "How tokens, cookies, and refresh interact.",
    bullets: [
      "Login or register → access_token in response → setAuthToken() in localStorage.",
      "withCredentials: true on Axios so refresh cookie is sent to POST /auth/refresh.",
      "On 401, the client refreshes once and retries; login/password routes skip refresh to avoid loops on wrong credentials.",
      "Logout clears local token and calls POST /auth/logout to invalidate server session.",
    ],
  },
  {
    id: "google-oauth",
    title: "Google OAuth",
    icon: "login",
    summary:
      "Single email, two ways in: a user can authenticate with Google or email/password and the backend keeps them on the same account.",
    paragraphs: [
      "The browser navigates (not XHR) to GET /auth/google. The backend 302s to Google's consent screen with AccessTypeOffline + ApprovalForce so a refresh token is issued. After the user grants access, Google calls GET /auth/google/callback on the backend with ?code=...",
      "GoogleOAuthLoginService then locates or creates the account: a) if the Google identity is already linked, sign in; b) if the email belongs to an existing password account, auto-link Google to it (Google has already verified the email); c) otherwise, create a new user with Google as the primary provider. The display_name is only filled when the user row has no name yet — subsequent sign-ins never overwrite it.",
      "The backend issues an app access token, sets the refresh_token httpOnly cookie scoped to /api/v1/auth/refresh, then 302s to FRONTEND_URL/oauth/callback with provider, user_id, email, display_name, and access_token in the query string. On failure (cancelled, expired, account not active, …) it redirects to the same SPA route with ?error=<code>.",
      "OAuthCallback.jsx reads access_token + email, calls setAuthToken(), scrubs the URL with history.replaceState, and routes the user to /dashboard. On ?error=… it toasts the human-readable message and routes back to /login.",
    ],
    bullets: [
      "Use a top-level link (<a href>) for the button — fetch/XHR cannot follow Google's redirect chain.",
      "/oauth/callback is intentionally outside GuestRoute since the user transitions from anonymous to authenticated on that route.",
      "FRONTEND_URL must match the dev server origin (Vite default 5173) so the success/failure redirect lands on the React app.",
      "Login.jsx surfaces the backend's `hint` (instead of the bland \"invalid credentials\") when the email belongs to a Google-only account so the user knows to use Google or Forgot Password to set a password.",
    ],
    code: `# 1) Configure Google Cloud Console
#    Authorized redirect URI:
#      http://localhost:8000/api/v1/auth/google/callback

# 2) Backend env (ZynQR-Server/.env)
CLIENT_ID=...
CLIENT_SECRET=...
REDIRECT_URL=http://localhost:8000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:5173

# 3) Frontend button (top-level navigation)
<a href={\`\${VITE_API_URL}/auth/google\`}>Continue with Google</a>

# 4) Backend success redirect → SPA route
<FRONTEND_URL>/oauth/callback?provider=google
  &user_id=...&email=...&display_name=...&access_token=...

# 5) Backend failure redirect → same SPA route, with an error code
<FRONTEND_URL>/oauth/callback?provider=google&error=invalid_credentials`,
  },
  {
    id: "auth-endpoints",
    title: "Auth endpoints",
    icon: "person",
    summary: "Registration, login, profile, sessions, and security.",
    endpoints: API_ENDPOINTS.filter((e) => e.path.startsWith("/auth")),
  },
  {
    id: "qr-endpoints",
    title: "Dynamic QR endpoints",
    icon: "qr_code_2",
    summary: "Create, update, list, analytics, and public redirects.",
    endpoints: API_ENDPOINTS.filter((e) => e.path.startsWith("/qr") || e.path.startsWith("/qr")),
  },
  {
    id: "static-endpoints",
    title: "Static QR endpoints",
    icon: "image",
    summary: "Direct-encoded QR images without scan tracking.",
    endpoints: API_ENDPOINTS.filter((e) => e.path.startsWith("/static")),
  },
  {
    id: "frontend-clients",
    title: "Frontend API clients",
    icon: "code",
    summary: "Where each endpoint is called in the React codebase.",
    paragraphs: API_FRONTEND_CLIENTS.map((c) => `${c.file} — ${c.role}`),
  },
  {
    id: "codebase",
    title: "Codebase & downloads",
    icon: "download",
    summary: "Repository layout and exportable API reference files.",
    paragraphs: [
      "The full stack is split into a Vite React frontend and a Gin Go API. Run the API on PORT (default 8000) and the UI with npm run dev (default 5173).",
      "Use the buttons in this section to download machine-readable API reference files generated from this page.",
    ],
  },
  {
    id: "usage-examples",
    title: "Usage examples",
    icon: "terminal",
    summary: "curl, fetch, and Axios patterns for auth, dynamic QRs, activity, and static QRs.",
    bullets: [
      "Set API to your backend base including /api/v1 — same value as VITE_API_URL in the React app.",
      "Protected routes need Authorization: Bearer <access_token> from login (or refresh).",
      "Refresh tokens are httpOnly cookies — use curl -c/-b or Axios withCredentials: true when testing refresh.",
      "Errors usually return JSON: { \"error\": \"message\" }. 401 means re-login; 429 means rate limited.",
      "Public scans use GET /qr/:id on the API host (not under /api/v1) — no Bearer header.",
    ],
    codeExamples: [
      {
        title: "Environment (bash)",
        code: `export API="http://localhost:8000/api/v1"
export TOKEN=""   # set after login
# Optional: persist refresh cookie for curl
# curl -c cookies.txt -b cookies.txt ...`,
      },
      {
        title: "Login · curl",
        code: `curl -s -X POST "$API/auth/login" \\
  -H "Content-Type: application/json" \\
  -c cookies.txt \\
  -d '{"email":"you@example.com","password":"secret"}'

# Response: { "access_token": "..." }
# Or with 2FA: { "requires_2fa": true, "two_factor_ticket": "..." }`,
      },
      {
        title: "Create dynamic QR · curl",
        code: `curl -s -X POST "$API/qr/create" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "you@example.com",
    "qr_name": "Summer campaign",
    "destination_url": "https://example.com/landing",
    "analytics_enabled": true
  }'`,
      },
      {
        title: "List QRs & activity · curl",
        code: `curl -s "$API/qr/get" \\
  -H "Authorization: Bearer $TOKEN"

curl -s "$API/qr/activity?limit=50&event_type=scan" \\
  -H "Authorization: Bearer $TOKEN"`,
      },
      {
        title: "Update QR · curl",
        code: `curl -s -X PUT "$API/qr/update/QR_UUID_HERE" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"destination_url":"https://new.example.com","status":"active"}'`,
      },
      {
        title: "Static QR · curl",
        code: `curl -s -X POST "$API/static-qr/create" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"WiFi guest","encoded_payload":"https://example.com/wifi"}'`,
      },
      {
        title: "Refresh token · curl",
        code: `curl -s -X POST "$API/auth/refresh" \\
  -b cookies.txt -c cookies.txt

# Response: { "access_token": "..." }`,
      },
      {
        title: "Google OAuth · browser only",
        code: `# Step 1 — start the flow (must be a top-level navigation, not XHR)
#   window.location.href = \`\${API}/auth/google\`;
# or, in HTML:
#   <a href="\${API}/auth/google">Continue with Google</a>

# Step 2 — Google sends the user to your backend callback
#   GET \${API}/auth/google/callback?code=...

# Step 3 — the backend 302s to your SPA with the access token in the URL
#   FRONTEND_URL/oauth/callback?provider=google
#     &access_token=...&user_id=...&email=...&display_name=...
#
# Step 4 — OAuthCallback.jsx stores the token, scrubs the URL, and routes to /dashboard.
# On failure (user cancelled, account not active, …) the redirect carries
#   ?error=<code>   →   invalid_credentials | email_not_verified |
#                       account_not_active | change_password_required |
#                       token_exchange_failed | userinfo_failed | code_missing | access_denied`,
      },
      {
        title: "Axios client (matches dashboard app)",
        code: `import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:8000/api/v1
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});`,
      },
      {
        title: "Login & create QR · Axios",
        code: `const { data: login } = await api.post("/auth/login", {
  email: "you@example.com",
  password: "secret",
});
localStorage.setItem("token", login.access_token);

const { data: created } = await api.post("/qr/create", {
  email: "you@example.com",
  qr_name: "Campaign",
  destination_url: "https://example.com",
  analytics_enabled: true,
});
// created includes QR id; scan URL is {PUBLIC_HOST}/qr/{id}`,
      },
      {
        title: "List QRs · fetch",
        code: `const API = "http://localhost:8000/api/v1";
const token = localStorage.getItem("token");

const res = await fetch(\`\${API}/qr/get\`, {
  headers: { Authorization: \`Bearer \${token}\` },
});
if (!res.ok) throw new Error((await res.json()).error ?? res.statusText);
const { qrs } = await res.json();`,
      },
      {
        title: "Public scan redirect (no auth)",
        code: `# Printed on dynamic QR codes — same host as API, not /api/v1
curl -sI "http://localhost:8000/qr/QR_UUID_HERE"
# 302 Location: https://your-destination...`,
      },
    ],
  },
];
