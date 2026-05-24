import { tablePagerBtnClass } from "../../lib/dashboard/constants";
import { getServerPagination } from "../../lib/dashboard/pagination";
import { useQrImagePreview } from "../../hooks/dashboard/useQrImagePreview";
import QrImagePreviewModal from "./QrImagePreviewModal";

/**
 * @typedef {Object} StaticQrTableRow
 * @property {string} id
 * @property {string} name
 * @property {string} created
 * @property {string} encoded_payload
 * @property {string} [image_data_url]
 */

/**
 * @param {{
 *   rows: StaticQrTableRow[];
 *   totalCount: number;
 *   page: number;
 *   pageSize: number;
 *   onPageChange: (page: number) => void;
 *   emptyMessage?: string;
 *   onRequestDelete?: (row: StaticQrTableRow) => void;
 * }} props
 */
export default function StaticQrCodesTable({
  rows,
  totalCount,
  page,
  pageSize,
  onPageChange,
  emptyMessage = "No static codes match your search.",
  onRequestDelete,
}) {
  const { preview, openPreviewFromRow, closePreview, isOpen } = useQrImagePreview();
  const { totalPages, safePage, rangeStart, rangeEnd } = getServerPagination({ totalCount, page, pageSize });

  return (
    <>
    <div className="rounded-3xl bg-surface-container-low p-1">
      <div className="flex flex-col overflow-hidden rounded-[1.25rem] bg-surface-container-lowest">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-5 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                  QR Name
                </th>
                <th className="px-6 py-5 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                  Short link
                </th>
                <th className="px-6 py-5 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                  Destination URL
                </th>
                <th className="px-6 py-5 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                  Scans
                </th>
                <th className="px-6 py-5 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                  Type
                </th>
                <th className="px-6 py-5 text-right text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-container-low/30">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {row.image_data_url?.trim() ? (
                        <button
                          type="button"
                          className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-outline-variant/20 bg-white ring-offset-2 transition hover:ring-2 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          aria-label={`Open preview for ${row.name}`}
                          onClick={() => openPreviewFromRow(row)}
                        >
                          <img
                            alt=""
                            className="h-full w-full object-contain p-0.5"
                            src={row.image_data_url}
                          />
                        </button>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high">
                          <span className="material-symbols-outlined text-on-surface-variant">image</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-on-surface">{row.name}</p>
                        <p className="text-xs text-on-surface-variant">Created {row.created}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-on-surface-variant" title="Static codes have no hosted redirect URL">
                      —
                    </span>
                  </td>
                  <td className="max-w-[220px] px-6 py-5">
                    <span className="block truncate font-mono text-sm text-on-surface-variant" title={row.encoded_payload}>
                      {row.encoded_payload}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-on-surface-variant">—</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex rounded-full bg-surface-container-high px-3 py-1 text-[10px] font-black tracking-wider text-on-surface-variant uppercase ring-1 ring-outline-variant/30">
                      Static
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
                        type="button"
                        aria-label={`Download ${row.name}`}
                        disabled={!row.image_data_url?.trim()}
                        title={row.image_data_url?.trim() ? "Preview and download" : "No QR image available"}
                        onClick={() => openPreviewFromRow(row)}
                      >
                        <span className="material-symbols-outlined text-xl">download</span>
                      </button>
                      <button
                        className="rounded-lg p-2 text-error transition-colors hover:bg-error-container"
                        type="button"
                        aria-label={`Delete ${row.name}`}
                        onClick={() => onRequestDelete?.(row)}
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-on-surface-variant">{emptyMessage}</p>
          ) : null}
        </div>

        {totalCount > 0 ? (
          <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-center text-xs text-on-surface-variant sm:text-left">
              Showing{" "}
              <span className="font-semibold text-on-surface">
                {rangeStart}–{rangeEnd}
              </span>{" "}
              of <span className="font-semibold text-on-surface">{totalCount}</span> static QR codes
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-1 sm:justify-end" aria-label="Static QR table pages">
              <button
                type="button"
                className={tablePagerBtnClass}
                aria-label="First page"
                disabled={safePage <= 1}
                onClick={() => onPageChange(1)}
              >
                {"<<"}
              </button>
              <button
                type="button"
                className={tablePagerBtnClass}
                aria-label="Previous page"
                disabled={safePage <= 1}
                onClick={() => onPageChange(Math.max(1, safePage - 1))}
              >
                {"<"}
              </button>
              <span
                className="min-w-18 px-2 text-center text-xs font-black tabular-nums text-on-surface"
                aria-current="page"
              >
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                className={tablePagerBtnClass}
                aria-label="Next page"
                disabled={safePage >= totalPages}
                onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
              >
                {">"}
              </button>
              <button
                type="button"
                className={tablePagerBtnClass}
                aria-label="Last page"
                disabled={safePage >= totalPages}
                onClick={() => onPageChange(totalPages)}
              >
                {">>"}
              </button>
            </nav>
          </div>
        ) : null}
      </div>
    </div>
    <QrImagePreviewModal
      open={isOpen}
      fileStem={preview?.fileStem ?? "qr"}
      imageSrc={preview?.src ?? ""}
      title={preview?.title ?? ""}
      onClose={closePreview}
    />
    </>
  );
}
