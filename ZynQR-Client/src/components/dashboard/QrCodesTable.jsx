import { Link } from "react-router-dom";
import { formatScans } from "../../lib/dashboard/qrTable";
import { tablePagerBtnClass } from "../../lib/dashboard/constants";
import { getServerPagination } from "../../lib/dashboard/pagination";
import { useQrImagePreview } from "../../hooks/dashboard/useQrImagePreview";
import QrImagePreviewModal from "./QrImagePreviewModal";

function AnalyticsBadge({ enabled }) {
  const on = enabled !== false;
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-auto sm:w-auto sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[9px] sm:font-black sm:tracking-wide sm:uppercase ${
        on
          ? "bg-tertiary-container/30 text-tertiary sm:bg-tertiary-container/30"
          : "bg-surface-container-high text-on-surface-variant"
      }`}
      title={on ? "Analytics on — scans recorded" : "Analytics off"}
    >
      <span
        className="material-symbols-outlined text-lg leading-none sm:text-base"
        style={on ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        analytics
      </span>
      <span className="hidden sm:inline">{on ? "On" : "Off"}</span>
    </span>
  );
}

function StatusBadge({ status }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-auto sm:w-auto sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[9px] sm:font-black sm:tracking-wide sm:uppercase ${
        active
          ? "bg-primary-fixed text-on-primary-fixed"
          : "bg-surface-container-high text-on-surface-variant"
      }`}
      title={active ? "Active" : "Inactive"}
    >
      <span className="material-symbols-outlined shrink-0 text-lg leading-none sm:text-base">
        {active ? "check_circle" : "pause_circle"}
      </span>
      <span className="hidden sm:inline">{active ? "Active" : "Inactive"}</span>
    </span>
  );
}

/**
 * @typedef {Object} QrCodeRow
 * @property {string} id
 * @property {string} name
 * @property {string} created
 * @property {string} shortLink
 * @property {string} destination
 * @property {number} scans
 * @property {"active"|"inactive"} status
 * @property {boolean} analyticsEnabled
 * @property {string} icon
 * @property {string} iconBg
 * @property {string} iconColor
 * @property {string} [qrImageUrl]
 */

/**
 * @param {{
 *   rows: QrCodeRow[];
 *   totalCount: number;
 *   page: number;
 *   pageSize: number;
 *   onPageChange: (page: number) => void;
 *   emptyMessage?: string;
 *   onRequestDelete?: (row: QrCodeRow) => void;
 * }} props
 */
export default function QrCodesTable({
  rows,
  totalCount,
  page,
  pageSize,
  onPageChange,
  emptyMessage = "No codes match your search.",
  onRequestDelete,
}) {
  const { preview, openPreviewFromRow, closePreview, isOpen } = useQrImagePreview();
  const { totalPages, safePage, rangeStart, rangeEnd } = getServerPagination({ totalCount, page, pageSize });

  return (
    <>
    <div className="rounded-3xl bg-surface-container-low p-1">
      <div className="flex flex-col overflow-hidden rounded-[1.25rem] bg-surface-container-lowest">
        <div className="overflow-x-auto">
          <table className="w-full min-w-208 border-collapse text-left lg:min-w-4xl">
            <colgroup>
              <col className="min-w-44 w-56" />
              <col className="w-34" />
              <col className="w-34" />
              <col className="w-12" />
              <col className="w-14" />
              <col className="w-14" />
              <col className="w-42" />
            </colgroup>
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-4 py-4 text-xs font-bold tracking-widest text-on-surface-variant uppercase">QR Name</th>
                <th className="px-4 py-4 text-xs font-bold tracking-widest text-on-surface-variant uppercase">Short Link</th>
                <th className="px-4 py-4 text-xs font-bold tracking-widest text-on-surface-variant uppercase">Destination</th>
                <th className="px-2 py-4 text-center text-xs font-bold tracking-widest text-on-surface-variant uppercase">Scans</th>
                <th className="px-2 py-4 text-center text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden" title="Analytics">
                    <span className="material-symbols-outlined text-base align-middle" aria-hidden>analytics</span>
                  </span>
                </th>
                <th className="px-2 py-4 text-center text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                  <span className="hidden sm:inline">Status</span>
                  <span className="sm:hidden" title="Status">
                    <span className="material-symbols-outlined text-base align-middle" aria-hidden>toggle_on</span>
                  </span>
                </th>
                <th className="px-2 py-4 text-right text-xs font-bold tracking-widest text-on-surface-variant uppercase sm:px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-container-low/30">
                  <td className="max-w-0 overflow-hidden px-4 py-4 align-middle">
                    <div className="flex min-w-0 items-center gap-3">
                      {row.qrImageUrl?.trim() ? (
                        <button type="button" className="group relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-outline-variant/20 bg-white ring-offset-2 transition hover:ring-2 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`Open preview for ${row.name}`} onClick={() => openPreviewFromRow(row)}>
                          <img alt="" className="h-full w-full object-contain p-0.5" src={row.qrImageUrl} />
                        </button>
                      ) : (
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${row.iconBg}`}>
                          <span className={`material-symbols-outlined ${row.iconColor}`}>{row.icon}</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate font-bold text-on-surface" title={row.name}>
                          {row.name}
                        </p>
                        <p className="truncate text-xs text-on-surface-variant">Created {row.created}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-0 overflow-hidden px-4 py-4 align-middle">
                    <a
                      className="block truncate font-mono text-sm font-medium text-tertiary hover:underline"
                      href={row.shortLink}
                      rel="noopener noreferrer"
                      target="_blank"
                      title={row.shortLink}
                    >
                      {row.shortLink}
                    </a>
                  </td>
                  <td className="max-w-0 overflow-hidden px-4 py-4 align-middle">
                    <span className="block truncate text-sm text-on-surface-variant" title={row.destination}>
                      {row.destination}
                    </span>
                  </td>
                  <td className="px-2 py-4 text-center align-middle">
                    <span className="text-sm font-bold tabular-nums text-on-surface">{formatScans(row.scans)}</span>
                  </td>
                  <td className="px-2 py-4 text-center align-middle">
                    <div className="flex justify-center">
                      <AnalyticsBadge enabled={row.analyticsEnabled} />
                    </div>
                  </td>
                  <td className="px-2 py-4 text-center align-middle">
                    <div className="flex justify-center">
                      <StatusBadge status={row.status} />
                    </div>
                  </td>
                  <td className="px-2 py-4 text-right align-middle sm:px-3">
                    <div className="flex shrink-0 flex-nowrap items-center justify-end gap-0 sm:gap-0.5">
                      <Link aria-label={`Edit ${row.name}`} className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container sm:p-2" to={`/dashboard/my-qrs/${row.id}/edit`}><span className="material-symbols-outlined text-lg sm:text-xl">edit</span></Link>
                      <Link aria-label={`Analytics for ${row.name}`} className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container sm:p-2" to={`/dashboard/my-qrs/${row.id}/analytics`}><span className="material-symbols-outlined text-lg sm:text-xl">bar_chart</span></Link>
                      <button className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40 sm:p-2" type="button" aria-label={`Download ${row.name}`} disabled={!row.qrImageUrl?.trim()} title={row.qrImageUrl?.trim() ? "Preview and download" : "No QR image available"} onClick={() => openPreviewFromRow(row)}><span className="material-symbols-outlined text-lg sm:text-xl">download</span></button>
                      <button className="rounded-lg p-1.5 text-error transition-colors hover:bg-error-container sm:p-2" type="button" aria-label={`Delete ${row.name}`} onClick={() => onRequestDelete?.(row)}><span className="material-symbols-outlined text-lg sm:text-xl">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="px-6 py-10 text-center text-sm text-on-surface-variant">{emptyMessage}</p> : null}
        </div>
        {totalCount > 0 ? (
          <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-center text-xs text-on-surface-variant sm:text-left">Showing <span className="font-semibold text-on-surface">{rangeStart}–{rangeEnd}</span> of <span className="font-semibold text-on-surface">{totalCount}</span> QR codes</p>
            <nav className="flex flex-wrap items-center justify-center gap-1 sm:justify-end" aria-label="QR codes table pages">
              <button type="button" className={tablePagerBtnClass} aria-label="First page" disabled={safePage <= 1} onClick={() => onPageChange(1)}>{"<<"}</button>
              <button type="button" className={tablePagerBtnClass} aria-label="Previous page" disabled={safePage <= 1} onClick={() => onPageChange(Math.max(1, safePage - 1))}>{"<"}</button>
              <span className="min-w-18 px-2 text-center text-xs font-black tabular-nums text-on-surface" aria-current="page">{safePage} / {totalPages}</span>
              <button type="button" className={tablePagerBtnClass} aria-label="Next page" disabled={safePage >= totalPages} onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}>{">"}</button>
              <button type="button" className={tablePagerBtnClass} aria-label="Last page" disabled={safePage >= totalPages} onClick={() => onPageChange(totalPages)}>{">>"}</button>
            </nav>
          </div>
        ) : null}
      </div>
    </div>
    <QrImagePreviewModal open={isOpen} fileStem={preview?.fileStem ?? "qr"} imageSrc={preview?.src ?? ""} title={preview?.title ?? ""} onClose={closePreview} />
    </>
  );
}
