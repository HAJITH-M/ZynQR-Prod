import { Link, useSearchParams } from "react-router-dom";
import SiteNavBar from "../../components/layout/SiteNavBar";

/**
 * Short, friendly descriptions for the `?error=` codes the backend appends to
 * `/email-verified` when something is wrong with the verification link. Keeping
 * these here (instead of on Login) means the user always lands on a dedicated
 * page that explains what happened before they go back to sign in.
 */
const ERROR_TITLES = {
  missing_token: "Verification link is incomplete",
  invalid_or_expired: "This link is no longer valid",
};

const ERROR_DESCRIPTIONS = {
  missing_token:
    "The link you used is missing the verification token. Please open the link from your email again, or request a new one from the login page.",
  invalid_or_expired:
    "This verification link has expired or has already been used. Sign in and ask for a new verification email if you still need to verify this address.",
};

export default function EmailVerified() {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get("error") ?? "";
  const isError = errorCode !== "";

  const heading = isError
    ? ERROR_TITLES[errorCode] ?? "Email verification failed"
    : "Account verified successfully";

  const description = isError
    ? ERROR_DESCRIPTIONS[errorCode] ??
      "We couldn't verify your email with this link. Please try again or request a new verification email."
    : "Your email has been verified and your ZynQR account is ready to use. Sign in to start creating QR codes and tracking scans.";

  const iconName = isError ? "report" : "verified";
  const iconWrapperClass = isError
    ? "bg-error-container/40 text-error"
    : "bg-primary/10 text-primary";

  const accentClass = isError ? "text-error" : "text-primary";

  return (
    <div className="light flex min-h-screen flex-col bg-background font-body text-on-surface">
      <SiteNavBar fixed />

      <main className="relative flex grow flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20">
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />

        <div className="z-10 flex w-full max-w-xl flex-col items-center text-center">
          <div
            className={`mb-8 flex h-28 w-28 items-center justify-center rounded-2xl bg-surface-container-lowest shadow-[0_24px_48px_-12px_rgba(22,28,31,0.08)] ${iconWrapperClass}`}
          >
            <span
              className="material-symbols-outlined text-6xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 48" }}
            >
              {iconName}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface md:text-5xl">
            {isError ? (
              heading
            ) : (
              <>
                Account <span className={accentClass}>verified</span> successfully
              </>
            )}
          </h1>
          <p className="mt-5 text-base leading-relaxed font-medium text-on-surface-variant md:text-lg">
            {description}
          </p>

          <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-on-primary shadow-[0_16px_32px_-8px_rgba(175,49,0,0.35)] transition-all hover:bg-primary-container active:scale-[0.98]"
              to="/login"
            >
              <span className="material-symbols-outlined text-xl">login</span>
              Go to login
            </Link>
            {isError ? (
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-container-high px-8 py-3.5 text-base font-bold text-on-surface transition-all hover:bg-surface-container-highest active:scale-[0.98]"
                to="/"
              >
                <span className="material-symbols-outlined text-xl">home</span>
                Back to home
              </Link>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
