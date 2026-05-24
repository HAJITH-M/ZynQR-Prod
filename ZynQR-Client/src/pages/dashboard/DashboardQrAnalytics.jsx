import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useQrActivityQuery,
  useQrAnalyticsSummaryQuery,
  useQrGrowthQuery,
  useQrListQuery,
} from "../../hooks/useQrList";
import GlobalAnalyticsScanLogSection, { SCAN_LOG_PAGE_SIZE } from "../../components/dashboard/GlobalAnalyticsScanLogSection";
import { DASHBOARD_PAGE_SHELL } from "../../layouts/dashboardPageClasses";
import { formatGrowthBucketUtcRange } from "../../utils/formatRelativeTime";
import { buildScanInsights } from "../../utils/scanLogAnalytics";

const GLOBAL_MAP_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBvR2zR25u4OGNLg_ttZsGSnrdj-R7LUBgbmfI3R3380ADQrRgZOoM84fUhwpX-lrXOf56DM3nrGJpenOKiDEf_wSXxTUrSNpPMEeG9qffGeK5T8LzvD1MAXS8rdWsuL3Yq0-WtIV7tFHTv2_iT5NBz_1hKyTZbq5zkkqYYAn7_ckx4Yw1pNMbqCr9KZGv005Rlx88UFHM5gixd-boJyu3826cY0BMFLqVf5CGzr3zGArPxku0M1cxLnE8yYO6qyfvYwkyoEA3QAEI";

const GROWTH_BAR_CLASSES = [
  "bg-primary/10 hover:bg-primary/30",
  "bg-primary/10 hover:bg-primary/30",
  "bg-primary/10 hover:bg-primary/30",
  "bg-primary/10 hover:bg-primary/30",
  "bg-primary/20 hover:bg-primary/30",
  "bg-primary/40 hover:bg-primary/30",
  "bg-primary",
];

/** Rows in “Top QR codes by scans” (sorted by scan count, descending). */
const TOP_QR_CODES_BY_SCANS_LIMIT = 8;

export default function DashboardQrAnalytics() {
  const [chartPeriod, setChartPeriod] = useState("daily");
  const [scanTablePage, setScanTablePage] = useState(1);
  const { data: rows = [], isLoading: listLoading } = useQrListQuery();
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryErr,
    refetch: refetchSummary,
  } = useQrAnalyticsSummaryQuery();
  const {
    data: growthBuckets = [],
    isLoading: growthLoading,
    isError: growthError,
    error: growthErr,
    refetch: refetchGrowth,
  } = useQrGrowthQuery(chartPeriod);
  const { data: scanRows = [], isLoading: scansLoading } = useQrActivityQuery({
    limit: 100,
    eventType: "scan",
  });

  const scanTotalPages = Math.max(1, Math.ceil(scanRows.length / SCAN_LOG_PAGE_SIZE));
  const effectiveScanPage = Math.min(Math.max(1, scanTablePage), scanTotalPages);

  const pagedScanRows = useMemo(() => {
    const start = (effectiveScanPage - 1) * SCAN_LOG_PAGE_SIZE;
    return scanRows.slice(start, start + SCAN_LOG_PAGE_SIZE);
  }, [scanRows, effectiveScanPage]);

  const scanRangeStart = scanRows.length === 0 ? 0 : (effectiveScanPage - 1) * SCAN_LOG_PAGE_SIZE + 1;
  const scanRangeEnd = scanRows.length === 0 ? 0 : Math.min(effectiveScanPage * SCAN_LOG_PAGE_SIZE, scanRows.length);

  const scanInsights = useMemo(() => buildScanInsights(scanRows), [scanRows]);

  const scanSample = summary?.scanSample ?? {
    sampleSize: 0,
    hasUserAgent: false,
    deviceShare: { mobilePct: 0, desktopPct: 0, tabletPct: 0 },
    topBrowsers: [],
  };

  const growthBars = useMemo(() => {
    const max = Math.max(1, ...growthBuckets.map((b) => b.count));
    return growthBuckets.map((b, i) => ({
      label: b.label,
      count: b.count,
      bucketStart: b.bucketStart,
      bucketEnd: b.bucketEnd,
      h: Math.max(6, Math.round((b.count / max) * 100)),
      className: GROWTH_BAR_CLASSES[Math.min(i, GROWTH_BAR_CLASSES.length - 1)],
    }));
  }, [growthBuckets]);

  const growthErrorMsg = growthError
    ? String(growthErr?.response?.data?.error ?? growthErr?.message ?? "Chart failed to load")
    : null;

  const totalScans = summary?.totalAggregateScans ?? 0;
  const activeCount = summary?.activeQrCount ?? 0;
  const totalQr = summary?.totalQrCount ?? 0;
  const conversionRate = summary?.conversionRate ?? 0;

  const topCodes = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.scans - a.scans)
      .slice(0, TOP_QR_CODES_BY_SCANS_LIMIT)
      .map((r) => ({
        id: r.id,
        icon: r.icon,
        name: r.name,
        codeId: r.id.slice(0, 8),
        scans: r.scans.toLocaleString("en-US"),
        scanShare: totalScans > 0 ? `${((Number(r.scans) / totalScans) * 100).toFixed(1)}%` : "—",
        status: r.status,
      }));
  }, [rows, totalScans]);

  const summaryErrorMsg = summaryError
    ? String(summaryErr?.response?.data?.error ?? summaryErr?.message ?? "Could not load summary")
    : null;
  const cardsLoading = summaryLoading;

  useEffect(() => {
    const prev = document.title;
    document.title = "ZynQR | Global Analytics Dashboard";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className={DASHBOARD_PAGE_SHELL}>
      <nav aria-label="Breadcrumb" className="md:hidden">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <li>
            <Link
              className="font-medium text-on-surface-variant transition-colors hover:text-primary"
              to="/dashboard"
            >
              Dashboard
            </Link>
          </li>
          <li className="select-none text-on-surface-variant/70" aria-hidden="true">
            /
          </li>
          <li className="font-semibold text-on-surface" aria-current="page">
            Global Analytics
          </li>
        </ol>
      </nav>

      <header className="md:pt-0">
        <h1 className="font-headline text-3xl font-black tracking-tight text-on-surface md:text-4xl">
          Global Analytics
        </h1>
        <p className="mt-1 max-w-2xl text-on-surface-variant">
          Totals and growth trends across your dynamic QRs. <strong className="text-on-surface">Global Scan Reach</strong>{" "}
          sits beside the chart; <strong className="text-on-surface">Device Share</strong> and{" "}
          <strong className="text-on-surface">Top Browsers</strong> are stacked below (next to Top QRs). Location and
          device breakdowns use scan data when available.
        </p>
      </header>

      {summaryErrorMsg ? (
        <div className="mb-6 rounded-2xl border border-error/20 bg-error-container/10 px-4 py-3 text-sm text-on-surface">
          <span className="font-semibold">Could not load summary stats.</span> {summaryErrorMsg}{" "}
          <button className="font-bold text-primary underline" type="button" onClick={() => refetchSummary()}>
            Retry
          </button>
        </div>
      ) : null}

      {/* Aggregate stats */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-primary-container p-8">
          <div className="relative z-10">
            <p className="text-sm font-bold tracking-wider text-on-primary-container/80 uppercase">
              Total Aggregate Scans
            </p>
            <h2 className="mt-2 font-headline text-5xl font-black text-on-primary-container">
              {cardsLoading ? "…" : totalScans.toLocaleString("en-US")}
            </h2>
          </div>
          <div className="relative z-10 mt-8 text-sm text-on-primary-container/90">
            Live total of recorded scans across your QRs
          </div>
          <div className="pointer-events-none absolute -right-8 -bottom-8 opacity-10 transition-transform duration-700 group-hover:scale-110">
            <span
              className="material-symbols-outlined text-[12rem] text-on-primary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              qr_code_2
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border-b-4 border-secondary bg-surface-container-low p-8">
          <div>
            <p className="text-sm font-bold tracking-wider text-on-surface-variant uppercase">Conversion rate</p>
            <h2 className="mt-2 font-headline text-5xl font-black text-on-surface">
              {cardsLoading ? "…" : conversionRate.toLocaleString("en-US", { maximumFractionDigits: 1 })}
            </h2>
          </div>
          <p className="mt-8 text-sm text-secondary">
            {totalQr > 0
              ? `Avg scans per QR (${summary?.qrsWithScans ?? 0} of ${totalQr} have scans)`
              : "Create a QR to see averages"}
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-xl border-b-4 border-tertiary bg-surface-container-low p-8">
          <div>
            <p className="text-sm font-bold tracking-wider text-on-surface-variant uppercase">Active QR codes</p>
            <h2 className="mt-2 font-headline text-5xl font-black text-on-surface">
              {cardsLoading ? "…" : activeCount.toLocaleString("en-US")}
            </h2>
          </div>
          <div className="mt-8 text-sm text-tertiary">
            Of {cardsLoading ? "…" : totalQr} total • QRs currently set to active
          </div>
        </div>
      </section>

      {/* Growth + Global Scan Reach (right column does not stretch to chart height) */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <div className="rounded-xl bg-surface-container-lowest p-8 shadow-sm lg:col-span-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-headline text-2xl font-extrabold text-on-surface">System-wide Growth</h2>
              <p className="text-sm text-on-surface-variant">
                Seven {chartPeriod} buckets of scan volume (UTC) from your workspace activity log.
              </p>
            </div>
            <div className="flex w-full flex-col gap-1 sm:w-auto sm:items-end">
              <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase" htmlFor="growth-period">
                Period
              </label>
              <select
                id="growth-period"
                className="min-w-48 cursor-pointer appearance-none rounded-xl border border-outline-variant/40 bg-surface-container-lowest py-2.5 pr-10 pl-4 text-sm font-bold text-on-surface shadow-sm outline-none transition-colors hover:border-primary/35 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.65rem center",
                  backgroundSize: "1.25rem",
                }}
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          {growthErrorMsg ? (
            <div className="mb-4 rounded-xl border border-error/20 bg-error-container/10 px-4 py-2 text-sm text-on-surface">
              {growthErrorMsg}{" "}
              <button className="font-bold text-primary underline" type="button" onClick={() => refetchGrowth()}>
                Retry
              </button>
            </div>
          ) : null}
          <div className="flex h-64 gap-2 px-4">
            {growthLoading ? (
              <p className="flex w-full items-center justify-center text-sm text-on-surface-variant">Loading chart…</p>
            ) : growthBars.length === 0 ? (
              <p className="flex w-full items-center justify-center text-sm text-on-surface-variant">
                No scan events in this range yet.
              </p>
            ) : (
              growthBars.map((bar, i) => (
                <div
                  key={`${bar.label}-${i}`}
                  className="group relative flex h-full min-h-0 flex-1 cursor-default flex-col items-center justify-end focus-within:outline-none"
                  tabIndex={0}
                  role="img"
                  aria-label={`${bar.label}: ${bar.count} scans in bucket ${bar.bucketStart ?? ""}`}
                >
                  <div
                    className="pointer-events-none absolute left-1/2 z-20 w-max max-w-[min(18rem,calc(100vw-2rem))] min-w-22 -translate-x-1/2 rounded-lg border border-outline-variant/60 bg-surface-container-highest px-2.5 py-2 text-center shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                    style={{ bottom: `calc(${bar.h}% + 0.5rem)` }}
                  >
                    <p className="text-[10px] font-bold tracking-wide text-on-surface-variant uppercase">{bar.label}</p>
                    <p className="mt-0.5 font-headline text-lg font-black tabular-nums text-primary">{bar.count}</p>
                    <p className="text-[10px] font-medium text-on-surface-variant">
                      {bar.count === 1 ? "scan" : "scans"} (activity log)
                    </p>
                    {bar.bucketStart && bar.bucketEnd ? (
                      <p className="mt-1.5 max-w-[16rem] whitespace-normal text-left text-[9px] leading-snug text-on-surface-variant/90">
                        {formatGrowthBucketUtcRange(bar.bucketStart, bar.bucketEnd)}
                      </p>
                    ) : null}
                  </div>
                  <div
                    className={`relative z-0 w-full max-w-full rounded-t-lg transition-colors ${bar.className}`}
                    style={{ height: `${bar.h}%`, minHeight: "6px" }}
                  />
                </div>
              ))
            )}
          </div>
          {!growthLoading && growthBars.length > 0 ? (
            <div className="mt-2 flex gap-2 px-4">
              {growthBars.map((bar, i) => (
                <div
                  key={`lbl-${bar.label}-${i}`}
                  className="min-w-0 flex-1 truncate text-center text-[10px] font-bold tracking-tight text-on-surface-variant"
                >
                  {bar.label}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="w-full lg:col-span-4">
          <div className="relative w-full overflow-hidden rounded-2xl bg-[#2d333a] p-4 text-white shadow-lg md:p-5">
            <h2 className="font-headline text-lg font-extrabold tracking-tight md:text-xl">Global Scan Reach</h2>
            <p className="mt-0.5 text-[11px] italic text-white/65">{scanInsights.topRegionLabel}</p>
            <p className="mt-0.5 text-[10px] leading-snug text-white/45">
              Top 5 · {scanInsights.sampleSize} scan{scanInsights.sampleSize === 1 ? "" : "s"}
              {!scanInsights.hasGeo && scanInsights.sampleSize > 0 ? " · geo from public IP" : ""}
            </p>
            <div className="mt-2 flex h-14 w-full items-center justify-center overflow-hidden rounded-lg bg-black/25 ring-1 ring-white/10">
              <img
                alt=""
                className="h-full w-full object-cover object-center opacity-50 grayscale"
                src={GLOBAL_MAP_SRC}
              />
            </div>
            <p className="mb-1.5 mt-2 text-[10px] font-black tracking-widest text-white/50 uppercase">Top 5</p>
            <div className="space-y-2">
              {scansLoading ? (
                <p className="text-xs text-white/60">Loading regions…</p>
              ) : scanInsights.countries.length === 0 ? (
                <p className="text-xs text-white/60">No scan data yet.</p>
              ) : (
                scanInsights.countries.map((c) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[10px] font-bold tracking-wide text-white uppercase">{c.name}</span>
                      <span className="shrink-0 text-[11px] font-black tabular-nums text-[#ff7a52]">
                        {c.count.toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="mt-0.5 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full min-w-0 rounded-full bg-[#ff7a52] transition-[width] duration-300"
                        style={{ width: `${c.barPct}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <GlobalAnalyticsScanLogSection
        scansLoading={scansLoading}
        scanRows={scanRows}
        pagedScanRows={pagedScanRows}
        effectiveScanPage={effectiveScanPage}
        scanTotalPages={scanTotalPages}
        scanRangeStart={scanRangeStart}
        scanRangeEnd={scanRangeEnd}
        onSetScanTablePage={setScanTablePage}
      />

      {/* Top QRs + device share + top browsers */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-xl bg-surface-container-lowest p-8 shadow-sm lg:col-span-2">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-headline text-xl font-extrabold text-on-surface">Top QR codes by scans</h2>
            <Link className="text-sm font-bold text-primary hover:underline" to="/dashboard/my-qrs">
              View All Codes
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-surface-container text-[10px] font-black tracking-widest text-on-surface-variant/60 uppercase">
                  <th className="pb-4">Campaign / ID</th>
                  <th className="pb-4">Total Scans</th>
                  <th className="pb-4">Share of scans</th>
                  <th className="pb-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(topCodes.length ? topCodes : []).map((row) => (
                  <tr key={row.id} className="group">
                    <td className="border-b border-surface-container py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                          <span className="material-symbols-outlined">{row.icon}</span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{row.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{row.codeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-surface-container py-6 font-bold text-on-surface">{row.scans}</td>
                    <td className="border-b border-surface-container py-6 font-bold text-secondary">{row.scanShare}</td>
                    <td className="border-b border-surface-container py-6 text-right">
                      {row.status === "active" ? (
                        <span className="inline-flex rounded-full bg-primary-fixed px-3 py-1 text-[10px] font-black tracking-tighter text-on-primary-fixed uppercase">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-surface-container-high px-3 py-1 text-[10px] font-black tracking-tighter text-on-surface-variant uppercase">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {!listLoading && topCodes.length === 0 ? (
                  <tr>
                    <td className="py-8 text-on-surface-variant" colSpan={4}>
                      No QR codes yet. Create one from My QRs or the overview card.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl bg-surface-container-low p-6 shadow-sm ring-1 ring-outline-variant/10 md:p-8">
            <h3 className="font-headline mb-1 text-lg font-extrabold text-on-surface">Device Share</h3>
            <p className="mb-5 text-[11px] text-on-surface-variant">
              Parsed from User-Agent on your latest scans (up to 100).
              {!scanSample.hasUserAgent && scanSample.sampleSize > 0
                ? " No UA stored on older rows — new scans include it."
                : ""}
            </p>
            {cardsLoading ? (
              <p className="text-sm text-on-surface-variant">Loading…</p>
            ) : scanSample.sampleSize === 0 ? (
              <p className="text-sm text-on-surface-variant">No scans yet.</p>
            ) : (
              <div className="space-y-6">
                {[
                  {
                    key: "mobile",
                    label: "Mobile",
                    icon: "smartphone",
                    pct: scanSample.deviceShare.mobilePct,
                    fill: "bg-primary",
                  },
                  {
                    key: "desktop",
                    label: "Desktop",
                    icon: "laptop_mac",
                    pct: scanSample.deviceShare.desktopPct,
                    fill: "bg-primary",
                  },
                  {
                    key: "tablet",
                    label: "Tablet",
                    icon: "tablet",
                    pct: scanSample.deviceShare.tabletPct,
                    fill: "bg-secondary",
                  },
                ].map((row) => (
                  <div key={row.key}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-on-surface-variant">{row.icon}</span>
                        <span className="text-sm font-bold text-on-surface">{row.label}</span>
                      </div>
                      <span className="text-sm font-black tabular-nums text-on-surface">{row.pct}%</span>
                    </div>
                    <div className="mt-2 h-3 w-full rounded-full bg-surface-container-high">
                      <div
                        className={`h-full rounded-full ${row.fill} transition-[width] duration-300`}
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm ring-1 ring-outline-variant/10 md:p-8">
            <h3 className="font-headline mb-1 text-lg font-extrabold text-on-surface">Top Browsers</h3>
            <p className="mb-5 text-[11px] text-on-surface-variant">
              Safari · Chrome · Edge · Other (grouped from browser name, latest scan sample).
            </p>
            {cardsLoading ? (
              <p className="text-sm text-on-surface-variant">Loading…</p>
            ) : scanSample.sampleSize === 0 ? (
              <p className="text-sm text-on-surface-variant">No scans yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {scanSample.topBrowsers.map((b) => (
                  <div
                    key={b.label}
                    className="rounded-xl bg-surface-container-low px-2 py-4 text-center ring-1 ring-outline-variant/10"
                  >
                    <p className="text-[10px] font-black tracking-wide text-on-surface-variant uppercase opacity-70">
                      {b.label}
                    </p>
                    <p className="font-headline text-xl font-black tabular-nums text-on-surface md:text-2xl">{b.pct}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
