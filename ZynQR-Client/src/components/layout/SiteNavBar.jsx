import { useQuery } from "@tanstack/react-query";
import { useMemo, useSyncExternalStore } from "react";
import { Link, NavLink } from "react-router-dom";
import { fetchAuthMe } from "../../api/auth.api";
import { getToken, subscribeAuthToken } from "../../api/axiosInstance";
import { userInitialFromMe } from "../../utils/userInitial";
import { siteNavActiveClass, siteNavLinkClass } from "./siteNavStyles";

const AUTH_ME_QUERY_KEY = ["auth", "me"];

function navClass(isActive) {
  return isActive ? siteNavActiveClass : siteNavLinkClass;
}

function readToken() {
  return getToken();
}

/**
 * Top bar for public site pages: logo, main links, Sign in vs Dashboard + profile.
 *
 * @param {{ fixed?: boolean }} props — `fixed` pins under viewport (add padding-top to content); default true.
 */
export default function SiteNavBar({ fixed = true }) {
  const token = useSyncExternalStore(subscribeAuthToken, readToken, () => null);
  const isAuthed = Boolean(token);
  const { data: me } = useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: fetchAuthMe,
    enabled: isAuthed,
  });
  const profileInitial = useMemo(() => userInitialFromMe(me), [me]);
  const accountAriaLabel = useMemo(() => {
    const n = String(me?.display_name ?? "").trim();
    if (n) return `Account settings for ${n}`;
    const e = String(me?.email ?? "").trim();
    if (e) return `Account settings (${e})`;
    return "Account settings";
  }, [me]);

  return (
    <nav
      className={`z-50 mx-auto flex h-16 w-full max-w-full items-center justify-between border-b border-outline-variant/20 bg-surface-bright px-6 shadow-[0_1px_0_rgba(22,28,31,0.06)] backdrop-blur-sm sm:px-8 ${fixed ? "fixed top-0" : "relative"}`}
      aria-label="Main"
    >
      <div className="flex items-center gap-8">
        <Link className="font-headline text-2xl font-black tracking-tighter text-primary" to="/">
          ZynQR
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <NavLink className={({ isActive }) => navClass(isActive)} end to="/">
            Home
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/features">
            Features
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/api">
            API
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/pricing">
            Pricing
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/contact">
            Contact
          </NavLink>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        {isAuthed ? (
          <>
            <Link
              className="rounded-full border border-primary/40 bg-primary/10 px-5 py-2 text-sm font-bold text-primary transition-all duration-150 ease-in-out hover:bg-primary/15 active:scale-95 sm:px-6"
              to="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              aria-label={accountAriaLabel}
              title={accountAriaLabel}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-outline-variant/60 bg-primary-container font-headline text-sm font-bold leading-none tracking-tight text-on-primary-container transition-colors hover:border-primary/50 hover:bg-primary-container/90"
              to="/dashboard/account"
            >
              <span className="block max-h-[1em] text-amber-50 translate-y-px leading-none">{profileInitial}</span>
            </Link>
          </>
        ) : (
          <Link
            className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-on-primary transition-all duration-150 ease-in-out hover:bg-primary-container active:scale-95"
            to="/login"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
