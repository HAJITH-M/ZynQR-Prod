import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthBrandPanel from "../../components/auth/AuthBrandPanel";
import AuthFormLogo from "../../components/auth/AuthFormLogo";
import GoogleOAuthButton from "../../components/auth/GoogleOAuthButton";
import PasswordField from "../../components/ui/PasswordField";
import TextField from "../../components/ui/TextField";
import { useRegistration } from "../../hooks/useRegistration";
import { toastApiError } from "../../utils/toast";

// Mirrors backend rules in pkg/utils/validPassword.go
const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter (A–Z)", test: (p) => /\p{Lu}/u.test(p) },
  { id: "lower", label: "One lowercase letter (a–z)", test: (p) => /\p{Ll}/u.test(p) },
  { id: "number", label: "One number (0–9)", test: (p) => /\p{N}/u.test(p) },
  { id: "special", label: "One special character (e.g. @ # $ !)", test: (p) => /[\p{P}\p{S}]/u.test(p) },
];

function Register() {
  const navigate = useNavigate();
  const submitLock = useRef(false);
  const registerMutation = useRegistration();
  const isPending = registerMutation.isPending;

  const [password, setPassword] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);

  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password],
  );
  const isPasswordValid = passwordChecks.every((c) => c.passed);
  const showPasswordHints = password.length > 0 || triedSubmit;
  const passwordHasError = triedSubmit && !isPasswordValid;

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitLock.current || isPending) return;

    if (!isPasswordValid) {
      setTriedSubmit(true);
      return;
    }

    submitLock.current = true;
    const formData = new FormData(e.currentTarget);
    const payload = {
      display_name: String(formData.get("full_name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    };
    try {
      await registerMutation.mutateAsync(payload);
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (error) {
      toastApiError(error, "Registration failed");
    } finally {
      submitLock.current = false;
    }
  }

  return (
    <div className="light flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-background font-body text-on-surface lg:flex-row">
      <AuthBrandPanel
        supporting="Create dynamic & static codes, track scans, and manage everything in one workspace."
        tagline="Join teams using ZynQR for precise, measurable QR campaigns."
      />

      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute top-0 right-0 h-72 w-72 -translate-y-1/2 translate-x-1/4 rounded-full bg-primary-container/10 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-56 w-56 translate-y-1/2 -translate-x-1/4 rounded-full bg-secondary-container/10 blur-[80px]" />
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-6 py-10 sm:px-10 lg:px-14 lg:py-6">
          <div className="mx-auto my-auto min-w-0 w-full max-w-[min(28rem,100%)]">
            <AuthFormLogo />
            <header className="mb-6 text-center lg:text-left">
              <h1 className="font-headline mb-1 text-3xl font-extrabold tracking-tighter text-on-surface md:text-4xl">
                Create your account
              </h1>
              <p className="text-sm text-on-surface-variant">A few details to get you started with ZynQR.</p>
            </header>

            <div className="glass-panel rounded-xl border border-outline-variant/10 p-8 shadow-[0_32px_64px_-12px_rgba(22,28,31,0.06)] md:p-10">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <TextField
                  id="full_name"
                  name="full_name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  type="text"
                  autoComplete="name"
                  startIcon="person"
                />
                <TextField
                  id="email"
                  name="email"
                  label="Email Address"
                  placeholder="name@company.com"
                  type="email"
                  autoComplete="email"
                  startIcon="mail"
                />
                <PasswordField
                  variant="settings"
                  id="password"
                  name="password"
                  label="Password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={passwordHasError || undefined}
                  aria-describedby={showPasswordHints ? "password-rules" : undefined}
                />

                {showPasswordHints ? (
                  <div
                    id="password-rules"
                    aria-live="polite"
                    className={`-mt-3 rounded-lg border p-3 transition-colors ${
                      passwordHasError
                        ? "border-error/40 bg-error-container/20"
                        : "border-outline-variant/20 bg-surface-container-low/40"
                    }`}
                  >
                    <p
                      className={`mb-2 text-xs font-medium uppercase tracking-wide ${
                        passwordHasError ? "text-error" : "text-on-surface-variant"
                      }`}
                    >
                      Password must include
                    </p>
                    <ul className="space-y-1.5">
                      {passwordChecks.map((check) => (
                        <li
                          key={check.id}
                          className={`flex items-center gap-2 text-sm transition-colors ${
                            check.passed
                              ? "text-primary"
                              : passwordHasError
                                ? "text-error"
                                : "text-on-surface-variant"
                          }`}
                        >
                          <span className="material-symbols-outlined text-base leading-none">
                            {check.passed ? "check_circle" : "radio_button_unchecked"}
                          </span>
                          {check.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="pt-2">
                  <button
                    className="font-headline flex w-full transform items-center justify-center gap-2 rounded-full bg-primary-container py-4 text-lg font-bold text-on-primary-container shadow-lg shadow-primary-container/20 transition-all duration-300 hover:bg-primary active:scale-95 disabled:pointer-events-none disabled:opacity-60"
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? "Creating…" : "Create Account"}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-on-surface-variant">
                  <span className="h-px flex-1 bg-outline-variant/40" />
                  <span>or</span>
                  <span className="h-px flex-1 bg-outline-variant/40" />
                </div>

                <GoogleOAuthButton variant="register" />
              </form>
            </div>

            <p className="mt-4 text-center text-sm text-on-surface-variant">
              Already have an account?
              <Link
                className="ml-1 font-bold text-primary decoration-2 underline-offset-4 hover:underline"
                to="/login"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
