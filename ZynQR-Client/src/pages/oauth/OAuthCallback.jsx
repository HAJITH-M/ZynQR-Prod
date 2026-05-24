import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAuthToken } from "../../api/axiosInstance";
import { toast } from "../../utils/toast";

/**
 * Maps the short error codes the backend appends as `?error=...` on the
 * Google OAuth callback into user-facing toast messages.
 */
const OAUTH_ERROR_MESSAGES = {
  email_not_verified: "Your email is not verified. Please verify it before signing in.",
  account_not_active: "This account is not active. Contact support if this is unexpected.",
  change_password_required: "Please reset your password before signing in.",
  invalid_credentials: "Google sign-in failed. Please try again.",
  code_missing: "Google sign-in was cancelled.",
  token_exchange_failed: "Couldn't complete Google sign-in. Please try again.",
  userinfo_failed: "Couldn't read your Google profile. Please try again.",
  userinfo_decode_failed: "Couldn't read your Google profile. Please try again.",
  userinfo_incomplete: "Your Google profile is missing required fields.",
  access_denied: "You cancelled the Google sign-in.",
};

function messageForError(code) {
  if (!code) return "Google sign-in failed. Please try again.";
  return OAUTH_ERROR_MESSAGES[code] || "Google sign-in failed. Please try again.";
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const error = params.get("error");
    if (error) {
      toast.error(messageForError(error));
      navigate("/login", { replace: true });
      return;
    }

    const accessToken = params.get("access_token");
    const email = params.get("email");

    if (!accessToken) {
      toast.error("Google sign-in failed. Please try again.");
      navigate("/login", { replace: true });
      return;
    }

    setAuthToken(accessToken);
    if (email) localStorage.setItem("email", email);

    // Remove the token + profile params from the address bar before navigating on.
    window.history.replaceState({}, document.title, "/oauth/callback");
    toast.success("Signed in with Google.");
    navigate("/dashboard", { replace: true });
  }, [navigate, params]);

  return (
    <div className="flex h-dvh items-center justify-center bg-background text-on-surface">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
        <p className="text-sm text-on-surface-variant">Completing Google sign-in…</p>
      </div>
    </div>
  );
}
