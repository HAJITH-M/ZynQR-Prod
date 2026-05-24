import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import AuthBrandPanel from "../../components/auth/AuthBrandPanel";
import AuthFormLogo from "../../components/auth/AuthFormLogo";
import GoogleOAuthButton from "../../components/auth/GoogleOAuthButton";
import OtpField from "../../components/ui/OtpField";
import PasswordField from "../../components/ui/PasswordField";
import TextField from "../../components/ui/TextField";
import { loginUser, verifyLogin2FA } from "../../api/auth.api";
import { setAuthToken } from "../../api/axiosInstance";
import { toast, toastApiError, toastWarning } from "../../utils/toast";

const LOGIN_OTP_NAME = "login_2fa_otp";

function collectOtpFromForm(form, prefix = LOGIN_OTP_NAME) {
  let s = "";
  for (let i = 0; i < 6; i++) {
    const el = form.elements.namedItem(`${prefix}_${i}`);
    s += el && "value" in el ? String(el.value) : "";
  }
  return s;
}

function finishAuthSuccess(data, navigate) {
  setAuthToken(data.access_token);
  localStorage.setItem("email", data.user.email);
  navigate("/dashboard");
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromRegistration = Boolean(location.state?.registered);
  const [step, setStep] = useState("password");
  const [twoFactorTicket, setTwoFactorTicket] = useState("");
  const [loginEmail, setLoginEmail] = useState("");

  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data?.requires_two_factor && data?.two_factor_ticket) {
        setTwoFactorTicket(data.two_factor_ticket);
        setStep("otp");
        return;
      }
      finishAuthSuccess(data, navigate);
    },
    onError: (error) => {
      // Google-only accounts get a helpful hint from the backend explaining how to proceed.
      // Surface that hint directly instead of the generic "invalid credentials".
      const data = error?.response?.data;
      if (data?.provider === "google" && typeof data?.hint === "string" && data.hint.trim()) {
        toast.error(data.hint);
        return;
      }
      toastApiError(error, "Login failed");
    },
  });

  const verify2FAMutation = useMutation({
    mutationKey: ["login-2fa"],
    mutationFn: verifyLogin2FA,
    onSuccess: (data) => {
      finishAuthSuccess(data, navigate);
    },
    onError: (error) => {
      toastApiError(error, "Invalid or expired code");
    },
  });

  const isPending = loginMutation.isPending || verify2FAMutation.isPending;

  function handlePasswordSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    setLoginEmail(email);
    loginMutation.mutate({
      email,
      password: String(formData.get("password") ?? ""),
    });
  }

  function handleOtpSubmit(e) {
    e.preventDefault();
    const otp = collectOtpFromForm(e.currentTarget).replace(/\D/g, "").slice(0, 6);
    if (otp.length !== 6) {
      toastWarning("Enter the full 6-digit code.");
      return;
    }
    verify2FAMutation.mutate({
      two_factor_ticket: twoFactorTicket,
      otp,
    });
  }

  return (
    <div className="light flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-background font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container lg:flex-row">
      <AuthBrandPanel
        supporting="Dynamic & static QR, analytics, and secure redirects."
        tagline="Precision QR solutions for teams that care about every scan."
      />

      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-[20%] -right-[5%] h-[30%] w-[30%] rounded-full bg-tertiary/5 blur-[100px]" />
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
          <div className="mx-auto my-auto min-w-0 w-full max-w-[min(440px,100%)]">
            <AuthFormLogo />
            <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-[0_32px_64px_-12px_rgba(22,28,31,0.06)] lg:p-10">
              {step === "password" ? (
                <>
                  {fromRegistration ? (
                    <div
                      className="mb-6 rounded-xl border border-primary/25 bg-primary/8 px-4 py-3 text-sm text-on-surface"
                      role="status"
                    >
                      <span className="font-bold text-primary">Account created.</span> Check your email if verification is
                      required, then sign in below.
                    </div>
                  ) : null}
                  <header className="mb-8 text-center lg:text-left">
                    <h1 className="font-headline mb-1 text-2xl font-bold text-on-surface md:text-3xl">Welcome back</h1>
                    <p className="text-sm text-on-surface-variant">Please enter your details to sign in.</p>
                  </header>

                  <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                <TextField
                  variant="auth"
                  id="login-email"
                  name="email"
                  label="Email Address"
                  placeholder="name@company.com"
                  type="email"
                  autoComplete="email"
                  required
                />
                <PasswordField
                  variant="settings"
                  id="login-password"
                  name="password"
                  label="Password"
                  placeholder="••••••••"
                  labelAccessory={
                    <Link
                      className="text-xs font-bold text-primary transition-colors hover:text-primary-container"
                      to="/forgot-password"
                    >
                      Forgot Password?
                    </Link>
                  }
                  required
                />

                <button
                  className="flex h-12 w-full transform items-center justify-center gap-2 rounded-full bg-primary font-bold text-on-primary shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary-container active:scale-95"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "Signing in..." : "Sign In"}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>

                <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-on-surface-variant">
                  <span className="h-px flex-1 bg-outline-variant/40" />
                  <span>or</span>
                  <span className="h-px flex-1 bg-outline-variant/40" />
                </div>

                <GoogleOAuthButton variant="login" />
              </form>
            </>
          ) : (
            <>
              <header className="mb-8 text-center lg:text-left">
                <h1 className="font-headline mb-1 text-2xl font-bold text-on-surface md:text-3xl">Check your email</h1>
                <p className="text-sm text-on-surface-variant">
                  We sent a 6-digit code to <span className="font-semibold text-on-surface">{loginEmail || "your inbox"}</span>.
                  Enter it below to finish signing in.
                </p>
              </header>

              <form className="space-y-6" onSubmit={handleOtpSubmit} autoComplete="off">
                <OtpField key={twoFactorTicket || "otp"} name={LOGIN_OTP_NAME} />
                <button
                  className="flex h-12 w-full transform items-center justify-center gap-2 rounded-full bg-primary font-bold text-on-primary shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary-container active:scale-95"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "Verifying..." : "Verify & sign in"}
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                </button>
                <button
                  className="w-full text-center text-sm font-bold text-primary hover:underline"
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setStep("password");
                    setTwoFactorTicket("");
                  }}
                >
                  ← Back to password
                </button>
              </form>
            </>
          )}


          <div className="mt-8 border-t border-surface-container-high pt-6 text-center">
            <p className="text-sm font-medium text-on-surface-variant">
              Don&apos;t have an account?
              <Link className="ml-1 font-bold text-primary hover:underline" to="/register">
                Create Account
              </Link>
            </p>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
