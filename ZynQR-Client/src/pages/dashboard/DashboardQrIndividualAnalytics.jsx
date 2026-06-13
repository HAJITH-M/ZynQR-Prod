import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UAParser } from "ua-parser-js";
import { useQrRowById, useQrScanFrequencyQuery, useQrScansQuery } from "../../hooks/useQrList";
import {
  formatActivityDateTime,
  formatGrowthBucketUtcRange,
  formatRelativeTime,
} from "../../utils/formatRelativeTime";
import { DASHBOARD_PAGE_INSET } from "../../layouts/dashboardPageClasses";
import QrExportFormatPanel from "../../components/dashboard/QrExportFormatPanel";

const SCAN_LOG_PAGE_SIZE = 10;
const scanLogPagerBtn =
  "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-2 text-sm font-bold text-on-surface transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface-container-lowest";

const QR_PREVIEW_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAoXRawcgkTmCD1vZJU5ywit1kGGyEBo60Pj6Of8CJRm1VbwXY5YfvueMiQPFB_JxpyTYfDwRbzM2E-D9VJudk9M_KSNZ5OEMLAHQYiu05fbMdza5upPj8ZQwjAuRMn_Za4n7Zu1qHZH6Gg3fe1skKkgfTOAUTQTKqmtPJerTK4fOBEfZv9FYEX7BcEWUOiCbxDHTAGK0VAffXY4CSyAFgH0_ed6Twygv3ZtNrse4VYnM14pTLt5Nz8LyIPjlYzuVpA1IBU5pN9SYM";

const HEATMAP_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAiy4VmIXiMWDdRZ3DDA_m6JHCU-LjCemHGZtd7Ll12gfcGUpLFQq_PwbYhqSO3L1ah_XrPy4XkH7Mx1yDWOBMOTw1yBM7MU3pGhO7hhHTCw5tulHq9GlAZcchqXykH7i_RNxXBqxQVDVlcXG-Pzl_EmjJBrtCL0y26y4NB8xUDb64s4FNGFUuilkO624kPIHwiA-8xH-jR-faDJereOmwMkNJZvG5GoUQunpieDm_K9SLPfxojnXN1FoKmsOPZBS-OkhEuibZoPvc";

const FREQ_BAR_CLASSES = [
  "bg-primary/10 hover:bg-primary/30",
  "bg-primary/10 hover:bg-primary/30",
  "bg-primary/10 hover:bg-primary/30",
  "bg-primary/10 hover:bg-primary/30",
  "bg-primary/20 hover:bg-primary/30",
  "bg-primary/40 hover:bg-primary/30",
  "bg-primary",
];

function fmtAxisCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

/** @param {string} [iso] */
function isUtcDateToday(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCDate() === now.getUTCDate()
  );
}

function maskClientIp(ip) {
  if (!ip) return "—";
  if (ip === "::1") return "::1 (local)";
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
  }
  if (ip.includes(":")) {
    const segs = ip.split(":");
    if (segs.length > 2) return `${segs.slice(0, 4).join(":")}:…`;
  }
  return ip;
}

/** @param {string} userAgent */
function scanDeviceMeta(userAgent) {
  if (!userAgent?.trim()) return { label: "—", icon: "devices" };
  const p = new UAParser(userAgent).getResult();
  const type = p.device.type;
  let icon = "laptop_mac";
  if (type === "tablet") icon = "tablet";
  else if (type === "mobile")
    icon = p.os.name?.toLowerCase().includes("android") ? "phone_android" : "smartphone";

  const model = [p.device.vendor, p.device.model].filter(Boolean).join(" ").trim();
  const osLine = [p.os.name, p.os.version?.split(".")[0]].filter(Boolean).join(" ").trim();
  const br = [p.browser.name, p.browser.version?.split(".")[0]].filter(Boolean).join(" ").trim();
  let label = "";
  if (model) label = `${model}${osLine ? `, ${osLine}` : ""}`;
  else if (br && osLine) label = `${br} on ${osLine}`;
  else label = osLine || br || userAgent.slice(0, 80);

  return { label, icon };
}

function formatScans(n) {
  return n.toLocaleString("en-US");
}

export default function DashboardQrIndividualAnalytics() {
  const { qrId } = useParams();
  const [range, setRange] = useState("30d");
  const [scanLogPage, setScanLogPage] = useState(1);
  const { row, isLoading, isError, error, refetch } = useQrRowById(qrId ?? "");
  const {
    data: scanRows = [],
    isLoading: scansLoading,
    isError: scansError,
    error: scansErr,
    refetch: refetchScans,
  } = useQrScansQuery(qrId ?? "", { limit: 50 });
  const {
    data: freqBuckets = [],
    isLoading: freqLoading,
    isError: freqError,
    error: freqErr,
    refetch: refetchFreq,
  } = useQrScanFrequencyQuery(qrId ?? "", range);

  const uniqueVisitors = useMemo(() => (row ? Math.round(row.scans * 0.738) : 0), [row]);

  const freqBarVisuals = useMemo(() => {
    const max = Math.max(1, ...freqBuckets.map((b) => b.count));
    return freqBuckets.map((b, i) => ({
      label: b.label,
      count: b.count,
      bucketStart: b.bucketStart,
      bucketEnd: b.bucketEnd,
      h: Math.max(4, Math.round((b.count / max) * 100)),
      className: FREQ_BAR_CLASSES[Math.min(i, FREQ_BAR_CLASSES.length - 1)],
    }));
  }, [freqBuckets]);

  /** 7d/30d: stretch bars across the chart width. 90d: fixed-width bars + horizontal scroll. */
  const freqBarsFillWidth = freqBarVisuals.length > 0 && freqBarVisuals.length <= 31;

  const freqYMax = useMemo(() => Math.max(1, ...freqBuckets.map((b) => b.count)), [freqBuckets]);
  const freqYTicks = useMemo(() => {
    const top = freqYMax;
    return [top, Math.floor((top * 2) / 3), Math.floor(top / 3), 0];
  }, [freqYMax]);

  const freqXLabels = useMemo(() => {
    const bars = freqBarVisuals;
    if (!bars.length) return { left: "", mid: "", right: "" };
    const last = bars.length - 1;
    const mid = Math.floor(last / 2);
    const rightLabel = isUtcDateToday(bars[last]?.bucketStart) ? "Today" : bars[last].label;
    return { left: bars[0].label, mid: bars[mid]?.label ?? "", right: rightLabel };
  }, [freqBarVisuals]);
  const returnRate = "73.8%";

  const scanLogTotalPages = Math.max(1, Math.ceil(scanRows.length / SCAN_LOG_PAGE_SIZE));
  const scanLogEffectivePage = Math.min(Math.max(1, scanLogPage), scanLogTotalPages);

  const pagedScanRows = useMemo(() => {
    const start = (scanLogEffectivePage - 1) * SCAN_LOG_PAGE_SIZE;
    return scanRows.slice(start, start + SCAN_LOG_PAGE_SIZE);
  }, [scanRows, scanLogEffectivePage]);

  const scanLogRangeStart =
    scanRows.length === 0 ? 0 : (scanLogEffectivePage - 1) * SCAN_LOG_PAGE_SIZE + 1;
  const scanLogRangeEnd =
    scanRows.length === 0
      ? 0
      : Math.min(scanLogEffectivePage * SCAN_LOG_PAGE_SIZE, scanRows.length);

  useEffect(() => {
    setScanLogPage(1);
  }, [qrId]);

  useEffect(() => {
    setScanLogPage((p) => Math.min(p, scanLogTotalPages));
  }, [scanLogTotalPages]);

  useEffect(() => {
    const prev = document.title;
    document.title = "ZynQR | Individual QR Performance";
    return () => {
      document.title = prev;
    };
  }, []);

  const loadError = isError ? String(error?.response?.data?.error ?? error?.message ?? "Failed to load") : null;
  const scansErrorMsg = scansError
    ? String(scansErr?.response?.data?.error ?? scansErr?.message ?? "Could not load scan log")
    : null;
  const freqErrorMsg = freqError
    ? String(freqErr?.response?.data?.error ?? freqErr?.message ?? "Could not load scan frequency")
    : null;
  const notFound = Boolean(qrId) && !isLoading && !isError && !row;

  return (
    <div className={DASHBOARD_PAGE_INSET}>
      <nav aria-label="Breadcrumb" className="mb-6 md:hidden">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <li>
            <Link className="font-medium text-on-surface-variant hover:text-primary" to="/dashboard">
              Dashboard
            </Link>
          </li>
          <li className="text-on-surface-variant/70" aria-hidden="true">
            /
          </li>
          <li>
            <Link className="font-medium text-on-surface-variant hover:text-primary" to="/dashboard/my-qrs">
              My QRs
            </Link>
          </li>
          <li className="text-on-surface-variant/70" aria-hidden="true">
            /
          </li>
          <li className="max-w-[40%] truncate font-semibold text-on-surface" aria-current="page">
            {row?.name ?? "…"}
          </li>
        </ol>
      </nav>

      {loadError ? (
        <div className="mb-6 rounded-xl border border-error/30 bg-error-container/10 px-4 py-3 text-sm">
          {loadError}{" "}
          <button className="font-bold text-primary underline" type="button" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <p className="py-12 text-center text-on-surface-variant">Loading QR…</p>
      ) : notFound ? (
        <div className="py-12 text-center">
          <p className="text-on-surface-variant">This QR was not found in your account.</p>
          <Link className="mt-4 inline-block font-bold text-primary underline" to="/dashboard/my-qrs">
            Back to My QRs
          </Link>
        </div>
      ) : null}

      {!row ? null : (
      <>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-3 text-xs font-bold tracking-widest text-primary uppercase">
            <Link
              className="flex items-center gap-1 transition-colors hover:text-primary-container hover:underline"
              to="/dashboard/my-qrs"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to My QRs
            </Link>
            <span className="text-outline-variant" aria-hidden="true">
              |
            </span>
            <Link
              className="transition-colors hover:text-primary-container hover:underline"
              to="/dashboard/analytics"
            >
              Global Analytics
            </Link>
          </div>
          <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <h1 className="font-headline text-3xl font-black tracking-tighter text-on-surface sm:text-4xl">
              {row.name}
            </h1>
            <span className="w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black text-primary uppercase">
              Individual QR Performance
            </span>
          </div>
          <p className="break-all text-on-surface-variant">
            Scan link:{" "}
            <a className="font-mono font-bold text-primary hover:underline" href={row.shortLink}>
              {row.shortLink}
            </a>{" "}
            • Created {row.created}
          </p>
          <p className="mt-2 max-w-2xl text-xs text-on-surface-variant">
            <strong className="text-on-surface">Total scans</strong>, <strong className="text-on-surface">scan frequency</strong>, and{" "}
            <strong className="text-on-surface">recent scan logs</strong> come from the API. Map preview below is still decorative.
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            className="flex w-full items-center justify-center gap-2 rounded-full bg-surface-container-high px-6 py-3 font-bold whitespace-nowrap text-on-surface transition-colors hover:bg-surface-container-highest sm:w-auto"
            to={`/dashboard/my-qrs/${row.id}/edit`}
          >
            <span className="material-symbols-outlined">edit</span>
            Edit QR
          </Link>
          {/* <button
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-bold whitespace-nowrap text-on-primary shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95 sm:w-auto"
            type="button"
          >
            <span className="material-symbols-outlined">ios_share</span>
            Share Report
          </button> */}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {row.analyticsEnabled === false ? (
          <div className="rounded-xl border border-amber-400/40 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
            <strong className="font-bold">Analytics is off for this QR.</strong> The scan link still redirects, but new
            opens are not counted or stored. Turn tracking back on from{" "}
            <Link className="font-bold text-primary underline" to={`/dashboard/my-qrs/${row.id}/edit`}>
              Edit QR
            </Link>
            .
          </div>
        ) : null}
        {/* Row 1: QR spans 2 rows; stats stack in column 2 so the block matches QR height (no dead gap). */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,1fr)] lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch">
          <div className="relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm sm:p-8 lg:row-span-2 lg:h-full">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-50" />
            <QrExportFormatPanel
              key={row.id}
              fileStem={row.id}
              imageSrc={row.qrImageUrl?.trim() ?? ""}
            >
              <div className="flex aspect-square w-full max-w-55 items-center justify-center rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-on-surface/5 sm:max-w-65 md:max-w-[min(100%,280px)] lg:max-h-[min(280px,40vh)]">
                {row.qrImageUrl ? (
                  <img alt="QR code" className="h-full w-full object-contain" src={row.qrImageUrl} />
                ) : (
                  <img alt="Dynamic QR code preview" className="h-full w-full object-contain" src={QR_PREVIEW_SRC} />
                )}
              </div>
            </QrExportFormatPanel>
          </div>

          <div className="relative flex h-full min-h-44 flex-col justify-center overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary to-primary/85 p-6 text-white shadow-lg shadow-primary/25 ring-1 ring-white/15 lg:min-h-0 lg:col-start-2 lg:row-start-1">
            <div className="pointer-events-none absolute -top-12 -right-8 h-36 w-36 rounded-full bg-white/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-black/20 blur-3xl" />
            <div className="relative z-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-black tracking-widest uppercase backdrop-blur-sm">
                <span className="material-symbols-outlined text-[16px] text-white" aria-hidden>
                  trending_up
                </span>
                Total scans
              </span>
              <h2 className="font-headline mt-4 text-4xl font-black tracking-tight tabular-nums sm:text-5xl">
                {formatScans(row.scans)}
              </h2>
              <p className="mt-3 max-w-56 text-xs font-medium leading-relaxed text-white/85">
                Live count from your server — every successful scan on this link.
              </p>
            </div>
            <span
              className="material-symbols-outlined pointer-events-none absolute -bottom-1 -right-1 text-[5.5rem] leading-none text-white/15"
              aria-hidden
            >
              analytics
            </span>
          </div>

          <div className="relative flex h-full min-h-44 flex-col justify-center overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-surface-container-lowest via-surface-container-lowest to-primary/5 p-6 shadow-md ring-1 ring-outline-variant/10 lg:min-h-0 lg:col-start-2 lg:row-start-2">
            <div className="pointer-events-none absolute top-0 right-0 h-28 w-28 rounded-bl-[100%] bg-primary/8" />
            <div className="relative z-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-black tracking-widest text-primary uppercase">
                <span className="material-symbols-outlined text-[16px]" aria-hidden>
                  diversity_3
                </span>
                Unique visitors
              </span>
              <h2 className="font-headline mt-4 text-4xl font-black tracking-tight text-on-surface tabular-nums sm:text-5xl">
                {formatScans(uniqueVisitors)}
              </h2>
              <p className="mt-3 max-w-60 text-xs leading-relaxed text-on-surface-variant">
                Estimated reach ({returnRate} return rate shown as a demo placeholder).
              </p>
            </div>
            <span
              className="material-symbols-outlined pointer-events-none absolute -bottom-2 -right-2 text-[5rem] leading-none text-primary/10"
              aria-hidden
            >
              groups
            </span>
          </div>
        </div>

        {/* Row 2: Scan frequency (full width) */}
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm sm:p-8">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-headline text-xl font-black tracking-tight text-on-surface">Scan Frequency</h3>
                <p className="text-sm text-on-surface-variant">
                  Daily scans for &quot;{row.name}&quot; over the selected window.
                </p>
              </div>
              <div className="flex rounded-full border border-outline-variant/20 bg-surface-container-low p-1">
                {[
                  { id: "7d", label: "7D" },
                  { id: "30d", label: "30D" },
                  { id: "90d", label: "90D" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    className={
                      range === id
                        ? "rounded-full bg-white px-4 py-1.5 text-xs font-bold text-primary shadow-sm"
                        : "rounded-full px-4 py-1.5 text-xs font-bold text-on-surface"
                    }
                    type="button"
                    onClick={() => setRange(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {freqErrorMsg ? (
              <div className="mb-4 rounded-xl border border-error/20 bg-error-container/10 px-4 py-2 text-sm text-on-surface">
                {freqErrorMsg}{" "}
                <button className="font-bold text-primary underline" type="button" onClick={() => refetchFreq()}>
                  Retry
                </button>
              </div>
            ) : null}
            <div className="relative flex min-w-0">
              {/* Y-axis stays fixed; only the bar row scrolls horizontally. */}
              <div
                className="pointer-events-none flex w-10 shrink-0 flex-col pt-20"
                aria-hidden="true"
              >
                <div className="flex h-64 flex-col justify-between py-2 pr-1 text-[10px] font-bold text-slate-300">
                  {freqYTicks.map((tick) => (
                    <div key={tick} className="flex w-full justify-end border-b border-slate-100">
                      <span>{fmtAxisCount(tick)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* pt reserves space so upward tooltips are not clipped. pr clears scrollbar overlap on the last bar (today). */}
              <div className="relative min-w-0 flex-1 overflow-x-auto overflow-y-visible pt-20 pr-8">
                <div
                  className={
                    freqBarsFillWidth
                      ? "relative z-10 flex h-64 w-full min-w-0 items-end gap-1 px-1"
                      : "relative z-10 flex h-64 min-w-min items-end gap-0.5 px-1"
                  }
                >
                  {freqLoading ? (
                    <div className="flex w-full items-center justify-center text-sm text-on-surface-variant">
                      Loading chart…
                    </div>
                  ) : freqBarVisuals.length === 0 ? (
                    <div className="flex w-full items-center justify-center text-sm text-on-surface-variant">
                      No data for this range.
                    </div>
                  ) : (
                    freqBarVisuals.map((bar, i) => {
                      const last = i === freqBarVisuals.length - 1;
                      const first = i === 0;
                      const only = freqBarVisuals.length === 1;
                      const tooltipPos = only
                        ? "left-1/2 -translate-x-1/2 text-center"
                        : last
                          ? "right-0 left-auto translate-x-0 text-right"
                          : first
                            ? "left-0 translate-x-0 text-left"
                            : "left-1/2 -translate-x-1/2 text-center";
                      return (
                        <div
                          key={`${bar.label}-${i}`}
                          className={
                            freqBarsFillWidth
                              ? "group relative flex h-full min-h-0 min-w-0 flex-1 cursor-default flex-col justify-end"
                              : "group relative flex h-full min-h-0 w-5 shrink-0 cursor-default flex-col justify-end sm:w-6"
                          }
                          tabIndex={0}
                          role="img"
                          aria-label={`${bar.label}: ${bar.count} scans`}
                        >
                          <div
                            className={`pointer-events-none absolute z-50 w-max max-w-[min(18rem,calc(100vw-2rem))] min-w-22 rounded-lg border border-outline-variant/60 bg-surface-container-highest px-2.5 py-2 shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 ${tooltipPos}`}
                            style={{ bottom: `calc(${bar.h}% + 0.5rem)` }}
                          >
                            <p className="text-[10px] font-bold tracking-wide text-on-surface-variant uppercase">
                              {bar.label}
                            </p>
                            <p className="mt-0.5 font-headline text-lg font-black tabular-nums text-primary">{bar.count}</p>
                            <p className="text-[10px] font-medium text-on-surface-variant">
                              {bar.count === 1 ? "scan" : "scans"} (this day, UTC bucket)
                            </p>
                            {bar.bucketStart && bar.bucketEnd ? (
                              <p className="mt-1.5 max-w-[16rem] whitespace-normal text-[9px] leading-snug text-on-surface-variant/90">
                                {formatGrowthBucketUtcRange(bar.bucketStart, bar.bucketEnd)}
                              </p>
                            ) : null}
                          </div>
                          <div
                            className={`relative z-1 w-full max-w-full rounded-t-sm transition-colors ${bar.className}`}
                            style={{ height: `${bar.h}%`, minHeight: "6px" }}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between px-2 pl-10 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
              <span>{freqXLabels.left}</span>
              <span>{freqXLabels.mid}</span>
              <span>{freqXLabels.right}</span>
            </div>
          </div>

        {/* Row 3: Recent scan logs (full width) */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-headline text-lg font-black tracking-tight text-on-surface">Recent Scan Logs</h3>
              <button className="text-left text-xs font-black text-on-surface-variant sm:text-right" disabled type="button">
                Export unavailable
              </button>
            </div>
            <p className="border-b border-slate-100 px-6 py-2 text-xs text-on-surface-variant">
              Each row is one redirect on your public scan link. City/country are approximate (from scanner IP when available).
            </p>
            {scansErrorMsg ? (
              <div className="border-b border-slate-100 px-6 py-3 text-sm text-error">
                {scansErrorMsg}{" "}
                <button className="font-bold text-primary underline" type="button" onClick={() => refetchScans()}>
                  Retry
                </button>
              </div>
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full min-w-140 text-left">
                <thead className="border-b border-slate-100 bg-surface-container-low/80">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
                      Location
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
                      Device / OS
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scansLoading ? (
                    <tr>
                      <td className="px-6 py-8 text-sm text-on-surface-variant" colSpan={4}>
                        Loading scan log…
                      </td>
                    </tr>
                  ) : scanRows.length === 0 ? (
                    <tr>
                      <td className="px-6 py-8 text-sm text-on-surface-variant" colSpan={4}>
                        No scans recorded yet. Open your scan link in a browser to create the first entry.
                      </td>
                    </tr>
                  ) : (
                    pagedScanRows.map((log) => {
                      const { label: devLabel, icon: devIcon } = scanDeviceMeta(log.userAgent);
                      return (
                        <tr key={log.id} className="transition-colors hover:bg-surface-container-low/50">
                          <td className="px-6 py-4 text-sm font-medium text-on-surface">
                            <span className="block">{formatActivityDateTime(log.scannedAt)}</span>
                            <span className="text-[11px] font-normal text-on-surface-variant">
                              {formatRelativeTime(log.scannedAt)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-on-surface">{log.locationLabel}</td>
                          <td className="px-6 py-4 text-sm text-on-surface">
                            <span className="inline-flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm text-primary">{devIcon}</span>
                              {devLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">
                            {maskClientIp(log.clientIp)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {!scansLoading && scanRows.length > 0 ? (
              <div className="flex w-full flex-col gap-3 border-t border-outline-variant/20 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <p className="text-xs text-on-surface-variant">
                  Showing{" "}
                  <span className="font-semibold text-on-surface">
                    {scanLogRangeStart}–{scanLogRangeEnd}
                  </span>{" "}
                  of <span className="font-semibold text-on-surface">{scanRows.length}</span> scans
                </p>
                <nav className="flex flex-wrap items-center gap-1" aria-label="Scan log pages">
                  <button
                    type="button"
                    className={scanLogPagerBtn}
                    aria-label="First page"
                    disabled={scanLogEffectivePage <= 1}
                    onClick={() => setScanLogPage(1)}
                  >
                    {"<<"}
                  </button>
                  <button
                    type="button"
                    className={scanLogPagerBtn}
                    aria-label="Previous page"
                    disabled={scanLogEffectivePage <= 1}
                    onClick={() => setScanLogPage((p) => Math.max(1, p - 1))}
                  >
                    {"<"}
                  </button>
                  <span
                    className="min-w-18 px-2 text-center text-xs font-black tabular-nums text-on-surface"
                    aria-current="page"
                  >
                    {scanLogEffectivePage} / {scanLogTotalPages}
                  </span>
                  <button
                    type="button"
                    className={scanLogPagerBtn}
                    aria-label="Next page"
                    disabled={scanLogEffectivePage >= scanLogTotalPages}
                    onClick={() => setScanLogPage((p) => Math.min(scanLogTotalPages, p + 1))}
                  >
                    {">"}
                  </button>
                  <button
                    type="button"
                    className={scanLogPagerBtn}
                    aria-label="Last page"
                    disabled={scanLogEffectivePage >= scanLogTotalPages}
                    onClick={() => setScanLogPage(scanLogTotalPages)}
                  >
                    {">>"}
                  </button>
                </nav>
              </div>
            ) : null}
          </div>
      </div>

      <div className="relative mt-8 h-96 w-full overflow-hidden rounded-2xl border border-outline-variant/15 shadow-sm">
        <img alt="Campaign reach heatmap" className="h-full w-full object-cover" src={HEATMAP_SRC} />
        <div className="glass-card absolute top-6 left-6 max-w-xs rounded-2xl border border-white/40 p-6">
          <h4 className="font-headline mb-2 font-black text-on-surface">Campaign Reach</h4>
          <p className="text-xs leading-relaxed text-on-surface-variant">
            Decorative preview. Per-scan locations use the scan log table above (from stored city/country when available).
          </p>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
