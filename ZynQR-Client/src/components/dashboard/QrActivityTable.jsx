import { formatActivityDateTime, formatRelativeTime } from "../../utils/formatRelativeTime";
import {
  activityDetailsText,
  activityEntityLabel,
  activityLocationLine,
} from "../../lib/dashboard/activity";
import { QR_ACTIVITY_TABLE_PAGE_SIZE, tablePagerBtnClass } from "../../lib/dashboard/constants";
import { useClientPagination } from "../../hooks/dashboard/useClientPagination";

export { QR_ACTIVITY_TABLE_PAGE_SIZE };

/**
 * Paginated activity table (scans, creates, updates, deletes).
 *
 * @param {{
 *   items: Array<{
 *     id: string;
 *     eventType?: string;
 *     title: string;
 *     detail: string;
 *     qrName?: string;
 *     clientIp?: string;
 *     city?: string;
 *     country?: string;
 *     createdAt: string;
 *     icon: string;
 *     iconWrap: string;
 *   }>;
 *   loading?: boolean;
 *   emptyHint: string;
 * }} props
 */
export default function QrActivityTable({ items, loading = false, emptyHint }) {
  const { effectivePage, pagedItems, rangeStart, rangeEnd, totalPages, setPage } = useClientPagination(
    items,
    QR_ACTIVITY_TABLE_PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-6 shadow-sm md:px-6">
        <p className="text-sm text-on-surface-variant">Loading activity…</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div
        className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-6 shadow-sm md:px-6"
      >
        <p className="text-sm text-on-surface-variant">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-4xl table-fixed text-left text-sm md:min-w-0">
          <colgroup>
            <col style={{ width: "2.75rem" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-outline-variant/40 bg-surface-container text-xs font-black leading-snug tracking-wider text-on-surface-variant uppercase md:text-[13px] md:tracking-widest">
              <th className="px-2 py-3.5 text-center md:py-4">#</th>
              <th className="px-3 py-3.5 md:py-4">Activity</th>
              <th className="px-3 py-3.5 md:py-4">QR / entity</th>
              <th className="px-3 py-3.5 md:py-4">Details</th>
              <th className="px-3 py-3.5 md:py-4">Date &amp; time</th>
              <th className="px-3 py-3.5 md:py-4">Location · IP</th>
              <th className="px-3 py-3.5 text-right md:py-4">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
            {pagedItems.map((row, rowIndex) => {
              const sno = (effectivePage - 1) * QR_ACTIVITY_TABLE_PAGE_SIZE + rowIndex + 1;
              const entity = activityEntityLabel(row);
              const details = activityDetailsText(row);
              const locIp = activityLocationLine(row);
              const whenLocal = formatActivityDateTime(row.createdAt);
              const relative = formatRelativeTime(row.createdAt);

              return (
                <tr key={row.id} className="align-middle">
                  <td className="w-11 px-1 py-2.5 text-center text-xs font-semibold tabular-nums text-on-surface-variant">
                    {sno}
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${row.iconWrap}`}
                        aria-hidden
                      >
                        <span className="material-symbols-outlined text-lg">{row.icon}</span>
                      </div>
                      <span className="min-w-0 truncate font-semibold text-on-surface" title={row.title}>
                        {row.title}
                      </span>
                    </div>
                  </td>
                  <td className="truncate px-2 py-2.5 text-on-surface" title={entity !== "—" ? entity : undefined}>
                    {entity}
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="line-clamp-2 wrap-break-word text-xs text-on-surface-variant" title={details}>
                      {details}
                    </span>
                  </td>
                  <td
                    className="truncate px-2 py-2.5 text-xs font-semibold tabular-nums text-primary"
                    title={whenLocal}
                  >
                    {whenLocal}
                  </td>
                  <td className="truncate px-2 py-2.5 text-xs text-on-surface-variant" title={locIp}>
                    {locIp}
                  </td>
                  <td className="truncate px-2 py-2.5 text-right text-xs font-medium text-on-surface-variant">
                    {relative}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex w-full flex-col gap-3 border-t border-outline-variant/20 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <p className="text-xs text-on-surface-variant">
          Showing{" "}
          <span className="font-semibold text-on-surface">
            {rangeStart}–{rangeEnd}
          </span>{" "}
          of <span className="font-semibold text-on-surface">{items.length}</span> events
        </p>
        <nav className="flex flex-wrap items-center gap-1" aria-label="Activity table pages">
          <button type="button" className={tablePagerBtnClass} aria-label="First page" disabled={effectivePage <= 1} onClick={() => setPage(1)}>
            {"<<"}
          </button>
          <button type="button" className={tablePagerBtnClass} aria-label="Previous page" disabled={effectivePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            {"<"}
          </button>
          <span className="min-w-18 px-2 text-center text-xs font-black tabular-nums text-on-surface" aria-current="page">
            {effectivePage} / {totalPages}
          </span>
          <button type="button" className={tablePagerBtnClass} aria-label="Next page" disabled={effectivePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            {">"}
          </button>
          <button type="button" className={tablePagerBtnClass} aria-label="Last page" disabled={effectivePage >= totalPages} onClick={() => setPage(totalPages)}>
            {">>"}
          </button>
        </nav>
      </div>
    </div>
  );
}
