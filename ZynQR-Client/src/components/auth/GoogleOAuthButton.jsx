/**
 * "Continue with Google" button.
 *
 * Google requires a full top-level navigation (not an XHR) to the consent screen,
 * so we send the browser straight to the backend's redirect endpoint, which itself
 * 302s to Google. After Google calls back to /api/v1/auth/google/callback, the
 * backend redirects to <FRONTEND_URL>/oauth/callback with the access token + profile.
 */

const GOOGLE_OAUTH_PATH = "/auth/google";

function googleOAuthHref() {
  const base = import.meta.env.VITE_API_URL ?? "";
  return `${String(base).replace(/\/+$/, "")}${GOOGLE_OAUTH_PATH}`;
}

function GoogleGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" width="18" height="18" focusable="false">
      <path
        fill="#EA4335"
        d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"
      />
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.63-.06-1.25-.17-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.79 2.72v2.27h2.9c1.69-1.56 2.69-3.86 2.69-6.64z"
      />
      <path
        fill="#FBBC05"
        d="M3.88 10.78a5.5 5.5 0 0 1 0-3.55V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l2.92-2.26z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.55-1.86.88-3.06.88-2.38 0-4.4-1.57-5.13-3.74l-2.91 2.26C2.44 15.98 5.48 18 9 18z"
      />
      <path fill="none" d="M0 0h18v18H0z" />
    </svg>
  );
}

/**
 * Variants:
 *  - "login"   → "Continue with Google"
 *  - "register"→ "Sign up with Google"
 */
export default function GoogleOAuthButton({ variant = "login", className = "" }) {
  const label = variant === "register" ? "Sign up with Google" : "Continue with Google";

  return (
    <a
      href={googleOAuthHref()}
      className={`flex h-12 w-full items-center justify-center gap-3 rounded-full border border-outline-variant/40 bg-surface-container-lowest text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low ${className}`}
    >
      <GoogleGlyph />
      <span>{label}</span>
    </a>
  );
}
