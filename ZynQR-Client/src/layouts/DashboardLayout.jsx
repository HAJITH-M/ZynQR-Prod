import { Link, Outlet, useLocation } from "react-router-dom";
import DashboardHeaderBreadcrumb from "../components/layout/DashboardHeaderBreadcrumb";
import DashboardSidebarNav from "../components/layout/DashboardSidebarNav";
import { useDashboardHeader } from "../hooks/dashboard/useDashboardHeader";
import { useDashboardMobileNav } from "../hooks/dashboard/useDashboardMobileNav";

function DashboardLayout() {
  const { pathname } = useLocation();
  const { mobileNavOpen, toggleMobileNav, closeMobileNav } = useDashboardMobileNav();
  const {
    profileInitial,
    accountAriaLabel,
    editQrId,
    analyticsQrId,
    editTitle,
    analyticsTitle,
  } = useDashboardHeader();

  return (
    <div className="light flex min-h-screen bg-background font-body text-on-surface">
      <aside className="sticky top-0 z-50 hidden h-screen min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r-0 bg-surface-container-low p-4 lg:flex">
        <DashboardSidebarNav />
      </aside>

      {mobileNavOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-55 bg-black/40 backdrop-blur-sm lg:hidden"
          type="button"
          onClick={closeMobileNav}
        />
      ) : null}

      <div
        aria-hidden={!mobileNavOpen}
        className={`fixed top-0 left-0 z-60 flex h-full min-h-0 w-64 max-w-[85vw] flex-col overflow-hidden border-r border-outline-variant/10 bg-surface-container-low p-4 shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          mobileNavOpen
            ? "pointer-events-auto translate-x-0"
            : "pointer-events-none -translate-x-full"
        }`}
        id="dashboard-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Settings navigation"
      >
        <DashboardSidebarNav onNavigate={closeMobileNav} showCloseButton />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex min-h-16 w-full items-center justify-between gap-3 bg-surface-bright px-4 py-2 sm:px-6 lg:px-8">
          <div className="relative z-10 flex shrink-0 items-center gap-2">
            <button
              aria-controls="dashboard-mobile-nav"
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              className="shrink-0 rounded-lg p-2 text-on-surface hover:bg-surface-container-low lg:hidden"
              type="button"
              onClick={toggleMobileNav}
            >
              <span className="material-symbols-outlined">
                {mobileNavOpen ? "close" : "menu"}
              </span>
            </button>
            <Link
              aria-label="ZynQR — go to marketing home"
              className="font-headline truncate text-lg font-black tracking-tighter text-on-background transition-opacity hover:opacity-80 sm:text-xl lg:text-2xl"
              to="/"
              onClick={() => {
                closeMobileNav();
                if (pathname === "/" || pathname === "") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              ZynQR
            </Link>
          </div>
          <div className="hidden min-w-0 flex-1 items-center justify-center md:flex lg:min-w-48">
            <DashboardHeaderBreadcrumb
              pathname={pathname}
              editQrId={editQrId}
              analyticsQrId={analyticsQrId}
              editTitle={editTitle}
              analyticsTitle={analyticsTitle}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:mr-2 sm:gap-2">
              {/* <button
                className="flex size-10 items-center justify-center p-0 text-on-surface transition-all hover:text-primary-container"
                type="button"
              >
                <span className="material-symbols-outlined text-2xl leading-none">notifications</span>
              </button> */}
              <Link
                aria-label="User guide"
                className="flex size-10 items-center justify-center p-0 text-on-surface transition-all hover:text-primary-container"
                title="User guide"
                to="/dashboard/guide"
              >
                <span className="material-symbols-outlined text-2xl leading-none">help</span>
              </Link>
            </div>
            <Link
              aria-label={accountAriaLabel}
              title={accountAriaLabel}
              className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-surface-container bg-primary-container font-headline text-sm font-bold leading-none tracking-tight text-on-primary-container transition-colors hover:border-primary/40"
              to="/dashboard/account"
            >
              <span className="block max-h-[1em] translate-y-px leading-none text-amber-50">{profileInitial}</span>
            </Link>
          </div>
        </header>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Outlet />
        </main>

        <footer className="bg-slate-100/50 p-8 text-center">
          <p className="font-label text-xs tracking-[0.2em] text-slate-400 uppercase">
            © 2026 ZynQR Precision QR. All Rights Reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default DashboardLayout;
