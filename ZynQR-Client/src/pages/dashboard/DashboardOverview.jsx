import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import QrActivityFeed from "../../components/dashboard/QrActivityFeed";
import { DASHBOARD_PAGE_SHELL } from "../../layouts/dashboardPageClasses";
import { useQrActivityQuery, useQrListQuery } from "../../hooks/useQrList";

/** Matches previous single-page preview size; paginate when API returns more. */
const OVERVIEW_ACTIVITY_PAGE_SIZE = 5;

const overviewActivityPagerBtn =
  "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-2 text-sm font-bold text-on-surface transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface-container-lowest";

const ACTIVITY_PREVIEW_EMPTY =
  "No activity yet. Create a QR, edit one, or get a scan on a dynamic short link — events will appear here.";

export default function DashboardOverview() {
  const [activityPage, setActivityPage] = useState(1);
  const [generateMenuOpen, setGenerateMenuOpen] = useState(false);

  useEffect(() => {
    if (!generateMenuOpen) return;
    function onKeyDown(e) {
      if (e.key === "Escape") setGenerateMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [generateMenuOpen]);
  const { data: rows = [], isLoading } = useQrListQuery();
  const {
    data: activityRows = [],
    isLoading: activityLoading,
    isError: activityError,
    error: activityErr,
    refetch: refetchActivity,
  } = useQrActivityQuery({ limit: 100 });

  const activityTotalPages = Math.max(1, Math.ceil(activityRows.length / OVERVIEW_ACTIVITY_PAGE_SIZE));
  const effectiveActivityPage = Math.min(Math.max(1, activityPage), activityTotalPages);

  const pagedActivityRows = useMemo(() => {
    const start = (effectiveActivityPage - 1) * OVERVIEW_ACTIVITY_PAGE_SIZE;
    return activityRows.slice(start, start + OVERVIEW_ACTIVITY_PAGE_SIZE);
  }, [activityRows, effectiveActivityPage]);

  const activityRangeStart =
    activityRows.length === 0 ? 0 : (effectiveActivityPage - 1) * OVERVIEW_ACTIVITY_PAGE_SIZE + 1;
  const activityRangeEnd =
    activityRows.length === 0
      ? 0
      : Math.min(effectiveActivityPage * OVERVIEW_ACTIVITY_PAGE_SIZE, activityRows.length);

  const { totalScans, activeQrCount, totalQr } = useMemo(() => {
    const totalQr = rows.length;
    const totalScans = rows.reduce((acc, r) => acc + (Number(r.scans) || 0), 0);
    const activeQrCount = rows.filter((r) => r.status === "active").length;
    return { totalScans, activeQrCount, totalQr };
  }, [rows]);

  const scansLabel = isLoading ? "…" : totalScans.toLocaleString("en-US");
  const activeLabel = isLoading ? "…" : String(activeQrCount);
  const totalLabel = isLoading ? "…" : String(totalQr);

  const activityErrorMsg = activityError
    ? String(activityErr?.response?.data?.error ?? activityErr?.message ?? "Could not load activity")
    : null;

  return (
    <div className={DASHBOARD_PAGE_SHELL}>
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="min-w-0">
          <h1 className="font-headline mb-2 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
            Workspace Dashboard
          </h1>
          <p className="max-w-lg leading-relaxed text-on-surface-variant">
            Welcome back! Here&apos;s a ZynQR check on your QR ecosystem performance for the last 30 days.
          </p>
        </div>
        <div className="flex w-full shrink-0 md:w-auto">
          <span
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-surface-container-high px-4 py-2.5 text-sm font-semibold text-on-surface md:w-auto md:min-h-10 md:py-2"
          >
            <span className="material-symbols-outlined shrink-0 text-sm" aria-hidden>
              calendar_today
            </span>
            <span className="truncate">Last 30 Days</span>
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group relative col-span-1 flex min-h-[220px] flex-col justify-between overflow-hidden rounded-4xl bg-surface-container-lowest p-6 sm:p-8 md:col-span-2">
          <div className="absolute top-0 right-0 p-8">
            <span className="material-symbols-outlined text-8xl text-primary/20 transition-transform duration-500 group-hover:scale-110">
              analytics
            </span>
          </div>
          <div>
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary-container/10 px-3 py-1 text-xs font-bold tracking-widest text-primary uppercase">
              <span className="h-1.5 w-1.5 animate-ZynQR rounded-full bg-primary" />
              Performance
            </span>
            <h2 className="text-sm font-medium text-on-surface-variant">Total Scans (all QRs)</h2>
            <div className="font-headline mt-2 text-5xl font-black text-on-surface">{scansLabel}</div>
          </div>
          <div className="mt-4 text-sm font-medium text-on-surface-variant">
            Combined scan totals across all your dynamic QRs.
          </div>
        </div>

        <div className="flex min-h-[200px] flex-col justify-between rounded-4xl bg-primary p-6 text-white shadow-2xl shadow-primary/20 transition-shadow hover:shadow-primary/30 sm:min-h-0 sm:p-8">
          <div>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                qr_code_2
              </span>
            </div>
            <h2 className="text-sm font-medium text-white/70">Active QRs</h2>
            <div className="font-headline mt-2 text-5xl font-black">{activeLabel}</div>
          </div>
          <div className="border-t border-white/10 pt-6">
            <p className="text-xs font-medium leading-relaxed text-white/80">
              {totalLabel} total in workspace • only QRs marked active are counted here
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xl font-bold text-on-surface">Recent Activity</h2>
            <Link className="text-sm font-bold text-primary hover:underline" to="/dashboard/recent-activity">
              View All
            </Link>
          </div>
          {activityErrorMsg ? (
            <div className="rounded-2xl border border-error/20 bg-error-container/10 px-4 py-3 text-sm text-on-surface">
              <span className="font-semibold">Activity</span> {activityErrorMsg}{" "}
              <button className="font-bold text-primary underline" type="button" onClick={() => refetchActivity()}>
                Retry
              </button>
            </div>
          ) : null}
          <div className="rounded-4xl bg-surface-container-low p-4">
            <QrActivityFeed
              items={pagedActivityRows}
              loading={activityLoading}
              emptyHint={ACTIVITY_PREVIEW_EMPTY}
            />
            {!activityLoading && activityRows.length > 0 ? (
              <div className="mt-3 flex flex-col gap-3 border-t border-outline-variant/20 px-1 pt-3 sm:flex-row sm:items-center sm:justify-between sm:px-2">
                <p className="text-xs text-on-surface-variant">
                  Showing{" "}
                  <span className="font-semibold text-on-surface">
                    {activityRangeStart}–{activityRangeEnd}
                  </span>{" "}
                  of <span className="font-semibold text-on-surface">{activityRows.length}</span> events
                </p>
                <nav className="flex flex-wrap items-center gap-1" aria-label="Recent activity pages">
                  <button
                    type="button"
                    className={overviewActivityPagerBtn}
                    aria-label="First page"
                    disabled={effectiveActivityPage <= 1}
                    onClick={() => setActivityPage(1)}
                  >
                    {"<<"}
                  </button>
                  <button
                    type="button"
                    className={overviewActivityPagerBtn}
                    aria-label="Previous page"
                    disabled={effectiveActivityPage <= 1}
                    onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                  >
                    {"<"}
                  </button>
                  <span
                    className="min-w-18 px-2 text-center text-xs font-black tabular-nums text-on-surface"
                    aria-current="page"
                  >
                    {effectiveActivityPage} / {activityTotalPages}
                  </span>
                  <button
                    type="button"
                    className={overviewActivityPagerBtn}
                    aria-label="Next page"
                    disabled={effectiveActivityPage >= activityTotalPages}
                    onClick={() => setActivityPage((p) => Math.min(activityTotalPages, p + 1))}
                  >
                    {">"}
                  </button>
                  <button
                    type="button"
                    className={overviewActivityPagerBtn}
                    aria-label="Last page"
                    disabled={effectiveActivityPage >= activityTotalPages}
                    onClick={() => setActivityPage(activityTotalPages)}
                  >
                    {">>"}
                  </button>
                </nav>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="relative flex flex-col overflow-hidden rounded-4xl border border-outline-variant/30 bg-surface-container-lowest p-6 sm:p-8">
            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
              <h2 className="font-headline mb-4 text-xl font-bold text-on-surface">Quick Create QR</h2>
              <p className="mb-6 text-sm leading-relaxed text-on-surface-variant sm:mb-8">
                Choose <strong className="text-on-surface">dynamic</strong> for tracked scans and analytics, or{" "}
                <strong className="text-on-surface">static</strong> for a direct-encoded image with no scan pipeline.
              </p>
              <div className="relative mt-auto w-full">
                <button
                  className="flex w-full min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-center text-sm font-bold text-on-primary shadow-xl shadow-primary/20 transition-colors hover:bg-primary-container sm:min-h-13 sm:py-3.5 sm:text-base active:scale-[0.98]"
                  type="button"
                  aria-expanded={generateMenuOpen}
                  aria-haspopup="dialog"
                  onClick={() => setGenerateMenuOpen((o) => !o)}
                >
                  <span className="material-symbols-outlined shrink-0 text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    bolt
                  </span>
                  <span className="leading-tight">Generate Code</span>
                  <span className="material-symbols-outlined shrink-0 text-lg opacity-90">
                    {generateMenuOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          </div>

          {/* <div className="flex items-center justify-between rounded-4xl bg-surface-container-high p-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                Storage Used
              </span>
              <span className="font-headline text-lg font-bold text-on-surface">8.4 GB / 20 GB</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48" aria-hidden>
                <circle className="text-slate-200" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4" />
                <circle
                  className="text-primary"
                  cx="24"
                  cy="24"
                  fill="transparent"
                  r="20"
                  stroke="currentColor"
                  strokeDasharray="125.6"
                  strokeDashoffset="75.3"
                  strokeWidth="4"
                />
              </svg>
            </div>
          </div> */}
        </div>  
      </div>

      <section className="group relative h-48 w-full overflow-hidden rounded-4xl ring-1 ring-white/10">
        {/* CSS gradient only — the old remote hero URL often fails (expired/blocked), which showed gray + broken alt text. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-br from-slate-950 via-primary to-tertiary transition-[filter] duration-700 group-hover:brightness-105"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-secondary-container/35 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 left-[15%] h-48 w-48 rounded-full bg-tertiary-fixed/25 blur-2xl"
        />
        <div className="absolute inset-0 flex items-center bg-linear-to-r from-black/55 via-black/25 to-transparent px-8 md:px-12">
          <div className="relative z-1 max-w-md">
            <h2 className="font-headline mb-2 text-2xl font-bold text-white drop-shadow-sm">
              New Feature: Smart Redirection
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-white/90 drop-shadow-sm">
              Route your users based on their device, location, or time of day automatically.
            </p>
            <Link
              className="inline-block rounded-full bg-white px-6 py-2 text-xs font-bold text-on-surface shadow-md transition-colors hover:bg-white/95"
              to="/features"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {generateMenuOpen ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label="Close dialog"
            onClick={() => setGenerateMenuOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="generate-code-dialog-title"
          >
            <button
              type="button"
              className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
              aria-label="Close"
              onClick={() => setGenerateMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <div className="border-b border-outline-variant/15 px-5 pb-4 pt-14 sm:px-8 sm:pb-5 sm:pt-12">
              <h2 id="generate-code-dialog-title" className="font-headline text-xl font-bold text-on-surface sm:text-2xl">
                Generate code
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                Pick the type that matches how your QR will be used. Static embeds text directly in the image; dynamic uses a
                short link you can change and measure.
              </p>
            </div>

            <div className="grid grid-cols-1 divide-y divide-outline-variant/15 md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="flex flex-col gap-4 p-5 sm:p-8">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                    <span className="material-symbols-outlined text-2xl text-primary">image</span>
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-headline text-lg font-bold text-on-surface">Static QR</h3>
                    <p className="mt-1 text-sm font-medium text-primary">Best for fixed content</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  The data you enter is encoded straight into the PNG. Anyone who scans gets that exact string—there is no
                  hosted redirect or server-side tracking for scans.
                </p>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
                    <span>Use when the destination never needs to change (Wi‑Fi join info, plain URL, contact card).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
                    <span>No scan counts or activity feed—privacy-simple and offline-friendly once printed.</span>
                  </li>
                </ul>
                <Link
                  className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-center text-sm font-bold text-on-primary shadow-lg shadow-primary/15 transition-colors hover:bg-primary-container sm:min-h-12"
                  to="/dashboard/create-static-qr"
                  onClick={() => setGenerateMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    add_circle
                  </span>
                  Create static QR
                </Link>
              </div>

              <div className="flex flex-col gap-4 bg-surface-container-low/60 p-5 sm:p-8 md:bg-surface-container-low/40">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                    <span className="material-symbols-outlined text-2xl text-primary">analytics</span>
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-headline text-lg font-bold text-on-surface">Dynamic QR</h3>
                    <p className="mt-1 text-sm font-medium text-primary">Best for campaigns and analytics</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Scanners hit your short link first, then redirect to the URL you set in the dashboard. You can update that
                  URL anytime without reprinting the code.
                </p>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
                    <span>Scan counts, status, and activity—same workflow as your existing dynamic QRs.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
                    <span>Ideal when links change often or you want measurable engagement.</span>
                  </li>
                </ul>
                <Link
                  className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-primary bg-transparent px-4 py-3 text-center text-sm font-bold text-primary transition-colors hover:bg-primary/10 sm:min-h-12"
                  to="/dashboard/create"
                  onClick={() => setGenerateMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    add_circle
                  </span>
                  Create dynamic QR
                </Link>
              </div>
            </div>

            {/* <div className="border-t border-outline-variant/15 px-5 py-3 text-center sm:px-8">
              <Link
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                to="/dashboard/static-qrs"
                onClick={() => setGenerateMenuOpen(false)}
              >
                View static QR list
              </Link>
            </div> */}
          </div>
        </div>
      ) : null}
    </div>
  );
}
