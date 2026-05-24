import { Link, useNavigate } from "react-router-dom";
import OtpField from "../../components/ui/OtpField";
import PasswordField from "../../components/ui/PasswordField";
import TextField from "../../components/ui/TextField";
import {
  useForgotPassword,
  useVerifyForgotPasswordOtp,
  useUpdateForgotPassword,
} from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { toastWarning } from "../../utils/toast";

const SEND_CODE_COOLDOWN_SEC = 30;

const OTP_NAME = "reset_otp";

function collectOtpFromForm(form, prefix = OTP_NAME) {
  let s = "";
  for (let i = 0; i < 6; i++) {
    const el = form.elements.namedItem(`${prefix}_${i}`);
    s += el && "value" in el ? String(el.value) : "";
  }
  return s;
}

function RecoveryStepRow({ stepNum, completed, active, label }) {
  const filled = completed || active;
  return (
    <div className="relative flex items-center gap-4">
      <div
        className={
          filled
            ? "z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary"
            : "z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-outline-variant bg-surface-container-highest text-[10px] font-bold"
        }
      >
        {completed && !active ? "✓" : stepNum}
      </div>
      <span
        className={
          active
            ? "font-label font-semibold text-primary"
            : completed
              ? "font-label font-medium text-on-surface"
              : "font-label font-medium text-on-surface-variant"
        }
      >
        {label}
      </span>
    </div>
  );
}

function ForgotPassword() {
  const navigate = useNavigate();
  const forgotMutation = useForgotPassword();
  const verifyMutation = useVerifyForgotPasswordOtp();
  const updateMutation = useUpdateForgotPassword();

  const [lastSentEmail, setLastSentEmail] = useState(null);
  const [otpVerified, setOtpVerified] = useState(false);
  /** Seconds left before "Resend" is allowed again after a successful send. */
  const [resendCooldownSec, setResendCooldownSec] = useState(0);

  useEffect(() => {
    if (resendCooldownSec <= 0) return undefined;
    const id = window.setInterval(() => {
      setResendCooldownSec((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendCooldownSec > 0]);

  const step1Active = !lastSentEmail;
  const step1Done = Boolean(lastSentEmail);
  const step2Active = Boolean(lastSentEmail) && !otpVerified;
  const step2Done = otpVerified;
  const step3Active = otpVerified;

  function handleSendReset(e) {
    e.preventDefault();
    if (lastSentEmail) return;
    const formData = new FormData(e.currentTarget);
    const emailTrimmed = String(formData.get("email") ?? "").trim();
    forgotMutation.mutate(
      { email: emailTrimmed },
      {
        onSuccess: () => {
          setLastSentEmail(emailTrimmed);
          setResendCooldownSec(SEND_CODE_COOLDOWN_SEC);
        },
      }
    );
  }

  function handleVerifyOtp(e) {
    e.preventDefault();
    if (!lastSentEmail || otpVerified) return;
    const form = e.currentTarget;
    const otp = collectOtpFromForm(form);
    if (otp.length !== 6) {
      toastWarning("Enter the full 6-digit code.");
      return;
    }
    verifyMutation.mutate(
      { email: lastSentEmail, otp },
      {
        onSuccess: () => setOtpVerified(true),
      }
    );
  }

  function handleResendCode() {
    if (!lastSentEmail || forgotMutation.isPending || resendCooldownSec > 0 || otpVerified) return;
    forgotMutation.mutate(
      { email: lastSentEmail },
      {
        onSuccess: () => setResendCooldownSec(SEND_CODE_COOLDOWN_SEC),
      }
    );
  }

  function handleUpdatePassword(e) {
    e.preventDefault();
    if (!lastSentEmail || !otpVerified) return;
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("newPassword") ?? "");
    const confirm = String(fd.get("confirmPassword") ?? "");
    if (password !== confirm) {
      toastWarning("Passwords do not match.");
      return;
    }
    // if (password.length < 12) {
    //   alert("Use at least 12 characters for your new password.");
    //   return;
    // }
    updateMutation.mutate(
      { email: lastSentEmail, password },
      {
        onSuccess: () => navigate("/login", { replace: true }),
      }
    );
  }

  const step2Locked = !lastSentEmail || otpVerified;
  const step3Locked = !otpVerified;

  return (
    <div className="light flex min-h-screen flex-col bg-background font-body text-on-surface">
      <header className="flex h-16 w-full items-center justify-between bg-slate-50 px-8">
        <Link className="font-headline text-2xl font-black tracking-tighter text-primary" to="/">
          ZynQR
        </Link>
        <div className="hidden gap-6 md:flex">
          <span className="font-label font-medium text-slate-600">Support</span>
          <span className="font-label font-medium text-slate-600">Contact Sales</span>
        </div>
      </header>

      <main className="relative flex grow flex-col items-center justify-center overflow-hidden p-4 pb-28 md:p-8">
        <div className="pointer-events-none absolute top-[-10%] right-[-10%] h-160 w-160 rounded-full bg-primary-container opacity-5 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-5%] left-[-5%] h-120 w-120 rounded-full bg-tertiary opacity-5 blur-[100px]" />

        <div className="glass-effect relative z-10 grid w-full max-w-4xl grid-cols-1 gap-0 overflow-hidden rounded-xl border border-outline-variant/15 shadow-2xl lg:grid-cols-12">
          <div className="relative flex flex-col justify-between overflow-hidden bg-surface-container-low p-8 md:p-12 lg:col-span-5">
            <div className="relative z-10">
              <h1 className="font-headline mb-6 text-4xl leading-tight font-extrabold tracking-tight text-on-surface">
                Secure your <br />
                <span className="text-primary">ZynQR.</span>
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-on-surface-variant">
                Precision QR management requires absolute security. Let&apos;s get you back into your
                workspace safely.
              </p>
              <div className="relative space-y-8">
                <div className="absolute top-4 bottom-4 left-[11px] w-0.5 bg-outline-variant/30" />
                <RecoveryStepRow
                  stepNum={1}
                  completed={step1Done}
                  active={step1Active}
                  label="Identify Account"
                />
                <RecoveryStepRow
                  stepNum={2}
                  completed={step2Done}
                  active={step2Active}
                  label="Verify Identity"
                />
                <RecoveryStepRow
                  stepNum={3}
                  completed={false}
                  active={step3Active}
                  label="New Password"
                />

                <button className="font-headline flex items-center text-sm font-bold text-primary    disabled:cursor-not-allowed disabled:opacity-60" 
                type="button" 
                onClick={() => navigate("/login")}>
                  <span className="material-symbols-outlined text-[10px]">arrow_back</span>
                  Back to Login
                </button>
              </div>
            </div>
            <div className="relative z-10 mt-12">
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>End-to-end encrypted recovery</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 md:p-12 lg:col-span-7">
            <div className="mx-auto max-w-md space-y-12">
              <section
                className={`space-y-6${lastSentEmail ? " pointer-events-none opacity-50" : ""}`}
                id="step-1"
              >
                <div className="space-y-2">
                  <h2 className="font-headline text-2xl font-bold text-on-surface">Forgot Password?</h2>
                  <p className="font-body text-on-surface-variant">
                    Enter the email address associated with your ZynQR account.
                  </p>
                </div>
                <form className="space-y-4" onSubmit={handleSendReset}>
                  <TextField
                    variant="editorial"
                    id="reset-email"
                    name="email"
                    label="Email Address"
                    placeholder="name@company.com"
                    type="email"
                    autoComplete="email"
                    readOnly={Boolean(lastSentEmail)}
                  />
                  <button
                    className="font-headline w-full rounded-full bg-primary py-4 text-lg font-bold text-on-primary shadow-lg shadow-primary/10 transition-all hover:bg-primary-container active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                    disabled={forgotMutation.isPending || Boolean(lastSentEmail)}
                  >
                    {!lastSentEmail && forgotMutation.isPending ? "Sending..." : "Send Reset Code"}
                  </button>
                </form>
              </section>

              <div className="h-px w-full bg-linear-to-r from-transparent via-outline-variant/30 to-transparent" />

              <section
                className={`space-y-6${step2Locked ? " pointer-events-none opacity-50" : ""}`}
                id="step-2"
              >
                <div className="space-y-2">
                  <h2 className="font-headline text-2xl font-bold text-on-surface">Check your inbox</h2>
                  <p className="font-body text-on-surface-variant">
                    {lastSentEmail ? (
                      <>
                        We sent a 6-digit code to{" "}
                        <span className="font-semibold text-on-surface">{lastSentEmail}</span>
                      </>
                    ) : (
                      <>We&apos;ll show the destination email here after you send the code.</>
                    )}
                  </p>
                  {/* {lastSentEmail && resendCooldownSec > 0 ? (
                    <p className="font-body text-sm text-on-surface-variant tabular-nums">
                      You can request another code in{" "}
                      <span className="font-semibold text-on-surface">{resendCooldownSec}</span>s
                    </p>
                  ) : null} */}
                </div>
                <form className="space-y-4" onSubmit={handleVerifyOtp}>
                  <OtpField disabled={step2Locked} name={OTP_NAME} />
                  <button
                    className="font-headline w-full rounded-full bg-primary py-4 text-lg font-bold text-on-primary shadow-lg shadow-primary/10 transition-all hover:bg-primary-container active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                    disabled={step2Locked || verifyMutation.isPending}
                  >
                    {verifyMutation.isPending ? "Verifying..." : "Verify"}
                  </button>
                </form>
                <div className="flex items-center justify-center gap-2 text-center">
                  {resendCooldownSec === 0 ? (
                    <span className="font-label text-sm font-medium text-on-surface-variant">
                      Haven&apos;t received it?
                    </span>
                  ) : null}
                  <button
                    className="font-label cursor-pointer text-sm font-semibold text-primary no-underline  hover:text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    disabled={
                      !lastSentEmail ||
                      forgotMutation.isPending ||
                      otpVerified ||
                      resendCooldownSec > 0
                    }
                    onClick={handleResendCode}
                  >
                    {resendCooldownSec > 0
                      ? `Resend available in ${resendCooldownSec}s`
                      : "Resend code"}
                  </button>
                </div>
              </section>

              <div className="h-px w-full bg-linear-to-r from-transparent via-outline-variant/30 to-transparent" />

              <section
                className={`space-y-6${step3Locked ? " pointer-events-none opacity-50" : ""}`}
                id="step-3"
              >
                <div className="space-y-2">
                  <h2 className="font-headline text-2xl font-bold text-on-surface">Set new password</h2>
                  <p className="font-body text-on-surface-variant">
                    Ensure it&apos;s at least 7 characters with a mix of symbols.
                  </p>
                </div>
                <form className="space-y-5" onSubmit={handleUpdatePassword}>
                  <PasswordField
                    variant="editorial"
                    id="reset-new-password"
                    name="newPassword"
                    label="New Password"
                    placeholder="••••••••••••"
                    showVisibilityToggle
                    autoComplete="new-password"
                    disabled={step3Locked}
                  />
                  <PasswordField
                    variant="editorial"
                    id="reset-confirm-password"
                    name="confirmPassword"
                    label="Confirm Password"
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    disabled={step3Locked}
                  />
                  <button
                    className="font-headline w-full rounded-full bg-primary py-4 text-lg font-bold text-on-primary shadow-lg shadow-primary/10 transition-all hover:bg-primary-container active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={step3Locked || updateMutation.isPending}
                    type="submit"
                  >
                    {updateMutation.isPending ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </section>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-8">
          <Link
            className="font-label flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-primary"
            to="/login"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Login
          </Link>
          <div className="h-4 w-px bg-outline-variant/30" />
          <a
            className="font-label text-sm text-slate-500 transition-colors hover:text-primary"
            href="#"
          >
            Security Policy
          </a>
        </div>
      </main>

      <footer className="bg-slate-100/50 p-8 text-center">
        <p className="font-label text-xs tracking-[0.2em] text-slate-400 uppercase">
          © 2026 ZynQR Precision QR. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

export default ForgotPassword;
