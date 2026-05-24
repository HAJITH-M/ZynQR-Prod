import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchAuthMe } from "../../api/auth.api";
import PasswordField from "../../components/ui/PasswordField";
import { useChangePassword, useUpdateAuthProfile } from "../../hooks/useAuth";
import { DASHBOARD_PAGE_INSET } from "../../layouts/dashboardPageClasses";
import { toastWarning } from "../../utils/toast";

const QUERY_ME = ["auth", "me"];
const MIN_PASSWORD_LENGTH = 8;
const MIN_DISPLAY_NAME = 3;
const MAX_DISPLAY_NAME = 100;

// Mirrors backend rules in pkg/utils/validPassword.go
function evaluateNewPasswordRules(password) {
  const hasMinLength = password.length >= MIN_PASSWORD_LENGTH;
  const hasUpper = /\p{Lu}/u.test(password);
  const hasLower = /\p{Ll}/u.test(password);
  const hasDigit = /\p{N}/u.test(password);
  const hasSpecial = /[\p{P}\p{S}]/u.test(password);
  return { hasMinLength, hasUpper, hasLower, hasDigit, hasSpecial };
}

function RequirementRow({ met, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`material-symbols-outlined mt-0.5 text-lg ${met ? "text-primary" : "text-on-surface-variant/30"}`}
        style={met ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {met ? "check_circle" : "radio_button_unchecked"}
      </span>
      <div>
        <p className={`text-sm font-bold ${met ? "text-on-surface" : "text-on-surface-variant/70"}`}>{title}</p>
        <p className="text-xs text-on-surface-variant">{description}</p>
      </div>
    </div>
  );
}

function ChangePasswordView() {
  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: QUERY_ME,
    queryFn: fetchAuthMe,
  });
  const { mutate: saveProfile, isPending: profileSaving } = useUpdateAuthProfile();
  const { mutate: changePw, isPending: passwordPending } = useChangePassword();

  const [displayDraft, setDisplayDraft] = useState("");
  const [displayBlurred, setDisplayBlurred] = useState(false);
  const [profileSubmitAttempted, setProfileSubmitAttempted] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!me) return;
    setDisplayDraft(String(me.display_name ?? ""));
  }, [me?.display_name, me?.user_id]);

  const accountEmail = useMemo(
    () => String(me?.email ?? "").trim() || String(localStorage.getItem("email") ?? "").trim(),
    [me?.email]
  );

  const trimmedDraft = displayDraft.trim();
  const displayRuneLen = useMemo(() => [...trimmedDraft].length, [trimmedDraft]);
  const serverName = String(me?.display_name ?? "").trim();
  const profileDirty = trimmedDraft !== serverName;
  const profileValid =
    trimmedDraft.length > 0 &&
    displayRuneLen >= MIN_DISPLAY_NAME &&
    displayRuneLen <= MAX_DISPLAY_NAME;

  const displayError = useMemo(() => {
    if (!displayBlurred && !profileSubmitAttempted) return null;
    if (trimmedDraft.length === 0) return "Enter a display name.";
    if (displayRuneLen < MIN_DISPLAY_NAME) return `Use at least ${MIN_DISPLAY_NAME} characters.`;
    if (displayRuneLen > MAX_DISPLAY_NAME) return `Use at most ${MAX_DISPLAY_NAME} characters.`;
    return null;
  }, [displayBlurred, profileSubmitAttempted, trimmedDraft, displayRuneLen]);

  const { hasMinLength, hasUpper, hasLower, hasDigit, hasSpecial } = useMemo(
    () => evaluateNewPasswordRules(newPassword),
    [newPassword]
  );

  const passwordsMatch = useMemo(() => {
    if (!newPassword || !confirmPassword) return false;
    return newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  const allRulesMet = hasMinLength && hasUpper && hasLower && hasDigit && hasSpecial;
  const allRequirementsMet = allRulesMet && passwordsMatch;

  const strength = useMemo(() => {
    const count = [hasMinLength, hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
    if (count === 0) return { label: "Weak", filled: 0, badgeClass: "bg-surface-dim text-on-surface-variant" };
    if (count <= 2) return { label: "Fair", filled: 1, badgeClass: "bg-primary-fixed text-primary" };
    if (count <= 4) return { label: "Good", filled: 2, badgeClass: "bg-primary-container text-on-primary-container" };
    return { label: "Strong", filled: 3, badgeClass: "bg-primary text-on-primary" };
  }, [hasMinLength, hasUpper, hasLower, hasDigit, hasSpecial]);

  function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileSubmitAttempted(true);
    if (!profileValid) {
      toastWarning(
        trimmedDraft.length === 0
          ? "Enter a display name."
          : displayRuneLen < MIN_DISPLAY_NAME
            ? `Display name must be at least ${MIN_DISPLAY_NAME} characters.`
            : `Display name must be at most ${MAX_DISPLAY_NAME} characters.`
      );
      return;
    }
    if (!profileDirty) return;
    saveProfile(trimmedDraft, {
      onSuccess: () => {
        setProfileSubmitAttempted(false);
        setDisplayBlurred(false);
      },
    });
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPw = String(formData.get("newPassword") ?? "");
    const confirmPw = String(formData.get("confirmPassword") ?? "");

    const rules = evaluateNewPasswordRules(newPw);
    if (
      !rules.hasMinLength ||
      !rules.hasUpper ||
      !rules.hasLower ||
      !rules.hasDigit ||
      !rules.hasSpecial
    ) {
      toastWarning("Please meet all security requirements for your new password.");
      return;
    }
    if (newPw !== confirmPw) {
      toastWarning("Passwords do not match.");
      return;
    }
    if (!accountEmail) {
      toastWarning("Session email missing. Please log in again.");
      return;
    }
    changePw(
      {
        email: accountEmail,
        new_password: newPw,
        old_password: currentPassword,
      },
      {
        onSuccess: () => {
          setNewPassword("");
          setConfirmPassword("");
        },
      }
    );
  }

  const twoFAEnabled = Boolean(me?.two_factor_enabled);

  const cardClass =
    "rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm sm:p-8";

  return (
    <div className={DASHBOARD_PAGE_INSET}>
      <div className="mb-8 lg:col-span-12">
        <nav className="mb-4 flex items-center gap-2 text-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface">Account settings</span>
        </nav>
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-background">Account settings</h1>
        <p className="mt-2 max-w-2xl text-on-surface-variant">
          Update how your name appears across ZynQR, confirm your email, and keep your password strong.
        </p>
      </div>

      <section className={`${cardClass} mb-10`} aria-labelledby="profile-heading">
        <div className="mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">badge</span>
          <h2 id="profile-heading" className="font-headline text-xl font-bold text-on-surface">
            Profile
          </h2>
        </div>
        {meLoading ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
            <div className="flex min-h-48 items-center lg:col-span-7">
              <p className="text-sm text-on-surface-variant">Loading profile…</p>
            </div>
            <aside
              className="relative flex min-h-48 flex-col justify-between overflow-hidden rounded-xl bg-on-surface p-6 text-white shadow-inner sm:p-7 lg:col-span-5"
              aria-busy="true"
              aria-label="Two-factor authentication"
            >
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/25 via-transparent to-transparent opacity-90" />
              <div className="relative z-10 flex flex-1 flex-col justify-center">
                <span className="material-symbols-outlined mb-3 text-4xl text-primary-container/80">shield_with_heart</span>
                <p className="text-sm text-white/70">Loading account security status…</p>
              </div>
            </aside>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
            <form className="min-w-0 space-y-6 lg:col-span-7" onSubmit={handleProfileSubmit}>
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label className="font-headline text-sm font-bold text-on-surface" htmlFor="account-email">
                    Email
                  </label>
                  <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant/40 bg-surface-container-high/80 px-2 py-0.5 text-[10px] font-bold tracking-wide text-on-surface-variant uppercase">
                    <span className="material-symbols-outlined text-sm leading-none">lock</span>
                    Read-only
                  </span>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-on-surface-variant/70">
                    <span className="material-symbols-outlined text-xl">mail</span>
                  </span>
                  <input
                    readOnly
                    tabIndex={-1}
                    className="settings-field-input cursor-not-allowed border-b-2 border-dashed border-outline-variant/50 bg-surface-dim/40 pl-11 text-on-surface-variant"
                    id="account-email"
                    type="email"
                    value={accountEmail || "—"}
                    aria-readonly="true"
                  />
                </div>
                <p className="mt-1.5 text-xs text-on-surface-variant">
                  This address is used to sign in and cannot be edited here.
                </p>
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                  <label className="font-headline text-sm font-bold text-on-surface" htmlFor="display-name">
                    Display name
                  </label>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    <span className="material-symbols-outlined text-base leading-none">edit</span>
                    Editable
                  </span>
                </div>
                <input
                  className={`settings-field-input transition-colors ${
                    displayError
                      ? "border-b-error text-error focus:border-b-error"
                      : "border-b-primary/25 focus:border-primary-container"
                  }`}
                  id="display-name"
                  name="display_name"
                  autoComplete="name"
                  maxLength={MAX_DISPLAY_NAME}
                  placeholder="Your name"
                  value={displayDraft}
                  aria-invalid={displayError ? "true" : "false"}
                  aria-describedby={displayError ? "display-name-error" : "display-name-hint"}
                  onChange={(e) => setDisplayDraft(e.target.value)}
                  onBlur={() => setDisplayBlurred(true)}
                />
                {displayError ? (
                  <p id="display-name-error" className="mt-1.5 text-xs font-semibold text-error" role="alert">
                    {displayError}
                  </p>
                ) : (<></>
                  // <p id="display-name-hint" className="mt-1.5 text-xs text-on-surface-variant">
                  //   Shown in the app header and account. {MIN_DISPLAY_NAME}–{MAX_DISPLAY_NAME} characters.
                  // </p>
                )}
              </div>
              <div>
                <button
                  className="rounded-full bg-primary px-8 py-3 font-bold text-on-primary shadow-lg shadow-primary-container/20 transition-all hover:bg-primary-container active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  type="submit"
                  disabled={profileSaving || !profileDirty || !profileValid}
                >
                  {profileSaving ? "Saving…" : "Save profile"}
                </button>
              </div>
            </form>

            <aside
              className="relative flex min-h-48 flex-col justify-between overflow-hidden rounded-xl bg-on-surface p-6 text-white shadow-inner sm:p-7 lg:col-span-5"
              aria-labelledby="profile-2fa-heading"
            >
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/25 via-transparent to-transparent opacity-90" />
              <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                <span className="material-symbols-outlined mb-3 text-4xl text-primary-container">
                  shield_with_heart
                </span>
                <h3 id="profile-2fa-heading" className="font-headline text-lg font-bold leading-tight">
                  Two-factor authentication
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  Add an email one-time code when you sign in with a password — extra protection for your QR codes and
                  account data.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold tracking-wide text-white/60 uppercase">Status</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      twoFAEnabled ? "bg-emerald-500/25 text-emerald-100" : "bg-white/10 text-amber-100"
                    }`}
                  >
                    {twoFAEnabled ? "On" : "Off"}
                  </span>
                </div>
                <div className="mt-auto flex flex-col gap-3 pt-8">
                  <Link
                    to="/dashboard/security"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-4 py-3 text-center text-sm font-bold text-on-primary-container transition-colors hover:bg-primary-fixed sm:w-auto sm:self-start"
                  >
                    {twoFAEnabled ? "Manage in Security" : "Turn on in Security"}
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                  <p className="text-[11px] leading-snug text-white/50">
                    2FA is configured on the Security page alongside sessions and audit log.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <h2 className="font-headline mb-2 text-2xl font-extrabold tracking-tight text-on-background">Password</h2>
          <p className="mb-6 max-w-2xl text-on-surface-variant">
            Use a unique password with mixed characters. Current password is required to set a new one.
          </p>
        </div>

        <div className={`${cardClass} lg:col-span-7`}>
          <form className="space-y-8" onSubmit={handlePasswordSubmit}>
            <div className="space-y-6">
              <PasswordField
                variant="settings"
                id="current-password"
                name="currentPassword"
                label="Current Password"
                placeholder="••••••••••••"
                autoComplete="current-password"
                labelAccessory={
                  <Link
                    className="text-xs font-semibold text-primary underline-offset-2 transition-colors hover:text-primary-container hover:underline"
                    to="/forgot-password"
                  >
                    Forgot password?
                  </Link>
                }
              />
              <PasswordField
                variant="settings"
                id="new-password"
                name="newPassword"
                label="New Password"
                placeholder="Enter new password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <PasswordField
                variant="settings"
                id="confirm-password"
                name="confirmPassword"
                label="Confirm New Password"
                placeholder="Confirm your new password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="pt-4">
              <button
                className="w-full rounded-full bg-primary px-10 py-4 font-bold text-white shadow-lg shadow-primary-container/20 transition-all hover:bg-primary-container active:scale-95 disabled:opacity-60 md:w-auto"
                type="submit"
                disabled={passwordPending || !allRequirementsMet}
                title={
                  !allRequirementsMet
                    ? allRulesMet && !passwordsMatch
                      ? "New password and confirmation must match"
                      : "Meet all security requirements to enable"
                    : undefined
                }
              >
                {passwordPending ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="relative overflow-hidden rounded-xl bg-surface-container p-8">
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary-container/10 blur-3xl" />
            <h3 className="font-headline mb-6 flex items-center gap-2 text-lg font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary">security</span>
              Security Requirements
            </h3>
            <div className="space-y-4">
              <RequirementRow
                met={hasMinLength}
                title="Length"
                description={`Must be at least ${MIN_PASSWORD_LENGTH} characters long.`}
              />
              <RequirementRow
                met={hasUpper}
                title="Uppercase"
                description="Include at least one uppercase letter (A-Z)."
              />
              <RequirementRow
                met={hasLower}
                title="Lowercase"
                description="Include at least one lowercase letter (a-z)."
              />
              <RequirementRow
                met={hasDigit}
                title="Numbers"
                description="Include at least one digit (0-9)."
              />
              <RequirementRow
                met={hasSpecial}
                title="Special character"
                description="Include at least one special character (e.g. @, #, $)."
              />
              <RequirementRow
                met={passwordsMatch}
                title="Match"
                description="New password and confirmation must be the same."
              />
            </div>
            <div className="mt-10 rounded-xl border border-primary-container/10 bg-surface-bright p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Password Strength</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black tracking-widest uppercase ${strength.badgeClass}`}
                >
                  {strength.label}
                </span>
              </div>
              <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-surface-dim">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-full min-w-0 flex-1 rounded-full transition-colors duration-200 ${
                      i < strength.filled ? "bg-primary" : "bg-surface-dim"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordView;
