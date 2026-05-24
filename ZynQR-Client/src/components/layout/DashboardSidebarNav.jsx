import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearAuthToken } from "../../api/axiosInstance";
import { logoutCurrentSession } from "../../api/auth.api";
import { LANDING_FREE_PLAN } from "../../lib/landing/pricingPlans";
import {
  dashboardSidebarLinks,
  isSidebarGroupActive,
  isSidebarLinkActive,
  navGroupTriggerActiveClass,
  navGroupTriggerClass,
  navGroupTriggerOpenClass,
  navItemActiveClass,
  navItemClass,
  navSubItemActiveClass,
  navSubItemClass,
} from "./dashboardNav";

const FILLED_WHEN_ACTIVE = new Set([
  "grid_view",
  "qr_code_2",
  "analytics",
  "history",
  "person",
  "shield",
  "menu_book",
  "api",
]);

function NavIcon({ name, active }) {
  return (
    <span
      className="material-symbols-outlined"
      style={active && FILLED_WHEN_ACTIVE.has(name) ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}

function SidebarNavGroup({ group, pathname, onNavigate }) {
  const groupActive = isSidebarGroupActive(group, pathname);
  const [open, setOpen] = useState(groupActive);

  useEffect(() => {
    if (groupActive) setOpen(true);
  }, [groupActive]);

  return (
    <div className="space-y-0.5">
      <button
        aria-expanded={open}
        className={
          groupActive
            ? navGroupTriggerActiveClass
            : open
              ? navGroupTriggerOpenClass
              : navGroupTriggerClass
        }
        type="button"
        onClick={() => setOpen((o) => !o)}
      >
        <NavIcon name={group.icon} active={false} />
        <span className="min-w-0 flex-1 text-left">{group.label}</span>
        <span
          className={`material-symbols-outlined text-lg text-on-surface-variant transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>
      {open ? (
        <div className="ml-3 space-y-0.5 border-l border-outline-variant/25 pl-2">
          {group.children.map((child) => (
            <NavLink
              key={child.to}
              className={({ isActive }) =>
                isSidebarLinkActive(child, isActive, pathname) ? navSubItemActiveClass : navSubItemClass
              }
              end={child.end}
              to={child.to}
              onClick={onNavigate}
            >
              {({ isActive }) => {
                const active = isSidebarLinkActive(child, isActive, pathname);
                return (
                  <>
                    <NavIcon name={child.icon} active={active} />
                    <span>{child.label}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardSidebarNav({ onNavigate, showCloseButton }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  async function handleLogout(e) {
    e.preventDefault();
    try {
      await logoutCurrentSession();
    } catch {
      // Always clear local auth even if server logout request fails.
    }
    clearAuthToken();
    localStorage.removeItem("email");
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-y-3">
      <div className="shrink-0">
        <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-3">
          <Link
            aria-label="ZynQR — go to marketing home"
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-0.5 outline-offset-2 transition-colors hover:bg-surface-bright/50 focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:outline-none"
            to="/"
            onClick={(e) => {
              onNavigate?.(e);
              if (pathname === "/" || pathname === "") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <img
              alt=""
              className="h-10 w-10 shrink-0 rounded-xl object-contain"
              decoding="async"
              height={40}
              src="/logo-zynqr.png"
              width={40}
            />
            <div className="min-w-0">
              <h2 className="font-headline text-lg leading-none font-bold text-on-background">ZynQR</h2>
              <p className="text-[10px] font-medium tracking-wider text-on-surface-variant/80 uppercase">
                Precision QR
              </p>
            </div>
          </Link>
          {showCloseButton ? (
            <button
              aria-label="Close navigation"
              className="rounded-lg p-2 text-on-surface hover:bg-surface-bright lg:hidden"
              type="button"
              onClick={onNavigate}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          ) : null}
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-y-contain pr-1 [-webkit-overflow-scrolling:touch]">
        {dashboardSidebarLinks.map((item) =>
          item.type === "group" ? (
            <SidebarNavGroup key={item.label} group={item} pathname={pathname} onNavigate={onNavigate} />
          ) : (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isSidebarLinkActive(item, isActive, pathname) ? navItemActiveClass : navItemClass
              }
              end={item.end}
              to={item.to}
              onClick={onNavigate}
            >
              {({ isActive }) => {
                const active = isSidebarLinkActive(item, isActive, pathname);
                return (
                  <>
                    <NavIcon name={item.icon} active={active} />
                    <span>{item.label}</span>
                  </>
                );
              }}
            </NavLink>
          ),
        )}
      </nav>

      <div className="shrink-0 space-y-3 border-t border-outline-variant/15 pt-3">
        <Link
          className="block rounded-xl bg-primary-fixed p-3 transition-opacity hover:opacity-95"
          to="/pricing"
          onClick={onNavigate}
        >
          <p className="text-xs font-bold text-on-primary-fixed">{LANDING_FREE_PLAN.tierLabel}</p>
          <p className="mt-1 text-[11px] leading-snug text-on-primary-fixed/90">
            {LANDING_FREE_PLAN.priceDisplay} — all features included
          </p>
          <span className="mt-3 flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-white sm:text-sm">
            View pricing
          </span>
        </Link>
        <NavLink
          className={`${navItemClass} hover:text-primary`}
          to="/login"
          onClick={(e) => {
            onNavigate?.(e);
            handleLogout(e);
          }}
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </NavLink>
      </div>
    </div>
  );
}
