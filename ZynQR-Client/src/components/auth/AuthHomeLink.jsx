import { Link } from "react-router-dom";

/**
 * Navigation back to the marketing home from auth pages (login, register).
 *
 * @param {{ className?: string; variant?: "default" | "onDark" }} props
 */
export default function AuthHomeLink({ className = "", variant = "default" }) {
  const tone =
    variant === "onDark"
      ? "text-white/80 hover:text-white"
      : "text-on-surface-variant hover:text-primary";

  return (
    <Link
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-1 text-sm font-semibold transition-colors ${tone} ${className}`}
      to="/"
    >
      <span className="material-symbols-outlined text-lg" aria-hidden>
        home
      </span>
      Home
    </Link>
  );
}
