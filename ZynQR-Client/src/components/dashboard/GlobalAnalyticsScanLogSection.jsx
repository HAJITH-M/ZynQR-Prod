import { formatActivityDateTime } from "../../utils/formatRelativeTime";
import { formatGlobalScanLogRow } from "../../lib/dashboard/activity";
import { SCAN_LOG_PAGE_SIZE, scanPagerBtnClass } from "../../lib/dashboard/constants";
import { tableSpacerRowCount } from "../../lib/dashboard/pagination";

export { SCAN_LOG_PAGE_SIZE };

/** Full-width scan log table + pagination (Global Analytics). */
export default function GlobalAnalyticsScanLogSection({
  scansLoading,
  scanRows,
  pagedScanRows,
  effectiveScanPage,
  scanTotalPages,
  scanRangeStart,
  scanRangeEnd,
  onSetScanTablePage,
}) {
  return (
    <section className="w-full" aria-labelledby="global-scan-log-heading">
      <div className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm md:p-8">
        <h3
          id="global-scan-log-heading"
          className="font-headline text-base font-extrabold tracking-tight text-on-surface md:text-lg"
        >
          Each scan · time + count
        </h3>
        <p className="mt-1 max-w-4xl text-xs text-on-surface-variant">
          One row per logged scan on your dynamic QRs. Count is always{" "}
          <strong className="text-on-surface">1</strong> per row; <strong className="text-on-surface">scan time</strong> is when
          the scan was recorded.
        </p>

        <div className="mt-4 w-full overflow-x-auto rounded-xl border border-outline-variant/30">
          <table className="w-full min-w-[640px] table-fixed text-left text-sm md:min-w-0">
            <colgroup>
              <col style={{ width: "2.75rem" }} />
              <col style={{ width: "19%" }} />
              <col style={{ width: "19%" }} />
              <col style={{ width: "19%" }} />
              <col style={{ width: "19%" }} />
              <col style={{ width: "19%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-outline-variant/40 bg-surface-container text-xs font-black leading-snug tracking-wider text-on-surface-variant uppercase md:text-[13px] md:tracking-widest">
                <th className="px-2 py-3.5 text-center md:py-4">#</th>
                <th className="px-3 py-3.5 md:py-4">Scan time (local)</th>
                <th className="px-3 py-3.5 md:py-4">QR name</th>
                <th className="px-3 py-3.5 text-center md:py-4">Count</th>
                <th className="px-3 py-3.5 md:py-4">QR id</th>
                <th className="px-3 py-3.5 md:py-4">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
              {scansLoading ? (
                <tr>
                  <td className="px-3 py-4 text-on-surface-variant" colSpan={6}>
                    Loading scans…
                  </td>
                </tr>
              ) : scanRows.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-on-surface-variant" colSpan={6}>
                    No logged scans yet. Share a dynamic QR short link to record your first scan.
                  </td>
                </tr>
              ) : (
                <>
                  {pagedScanRows.map((row, rowIndex) => {
                    const sno = (effectiveScanPage - 1) * SCAN_LOG_PAGE_SIZE + rowIndex + 1;
                    const display = formatGlobalScanLogRow(row, sno);
                    return (
                      <tr key={row.id} className="h-12 align-middle">
                        <td className="w-11 px-1 py-2.5 text-center text-xs font-semibold tabular-nums text-on-surface-variant">
                          {display.serialNo}
                        </td>
                        <td className="truncate px-2 py-2.5 font-medium tabular-nums text-on-surface" title={formatActivityDateTime(row.createdAt)}>
                          {formatActivityDateTime(row.createdAt)}
                        </td>
                        <td className="truncate px-2 py-2.5 font-medium text-on-surface" title={display.qrName !== "—" ? display.qrName : undefined}>
                          {display.qrName}
                        </td>
                        <td className="px-2 py-2.5 text-center font-bold text-primary">1</td>
                        <td className="truncate px-2 py-2.5 font-mono text-xs text-on-surface-variant" title={display.qrIdTitle}>
                          {display.qrIdShort}
                        </td>
                        <td className="truncate px-2 py-2.5 font-mono text-xs text-on-surface-variant" title={display.clientIpTitle}>
                          {display.clientIp}
                        </td>
                      </tr>
                    );
                  })}
                  {Array.from({ length: tableSpacerRowCount(pagedScanRows.length, SCAN_LOG_PAGE_SIZE) }, (_, i) => (
                    <tr
                      key={`scan-table-spacer-${effectiveScanPage}-${i}`}
                      aria-hidden
                      className="h-12 border-outline-variant/10 align-middle"
                    >
                      <td colSpan={6} className="bg-surface-container-lowest px-3 py-0" />
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {!scansLoading && scanRows.length > 0 ? (
          <div className="mt-3 flex w-full flex-col gap-3 border-t border-outline-variant/20 px-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-3">
            <p className="text-xs text-on-surface-variant">
              Showing{" "}
              <span className="font-semibold text-on-surface">
                {scanRangeStart}–{scanRangeEnd}
              </span>{" "}
              of <span className="font-semibold text-on-surface">{scanRows.length}</span> scans
            </p>
            <nav className="flex flex-wrap items-center gap-1" aria-label="Scan table pages">
              <button type="button" className={scanPagerBtnClass} aria-label="First page" disabled={effectiveScanPage <= 1} onClick={() => onSetScanTablePage(1)}>{"<<"}</button>
              <button type="button" className={scanPagerBtnClass} aria-label="Previous page" disabled={effectiveScanPage <= 1} onClick={() => onSetScanTablePage((p) => Math.max(1, p - 1))}>{"<"}</button>
              <span className="min-w-18 px-2 text-center text-xs font-black tabular-nums text-on-surface" aria-current="page">{effectiveScanPage} / {scanTotalPages}</span>
              <button type="button" className={scanPagerBtnClass} aria-label="Next page" disabled={effectiveScanPage >= scanTotalPages} onClick={() => onSetScanTablePage((p) => Math.min(scanTotalPages, p + 1))}>{">"}</button>
              <button type="button" className={scanPagerBtnClass} aria-label="Last page" disabled={effectiveScanPage >= scanTotalPages} onClick={() => onSetScanTablePage(scanTotalPages)}>{">>"}</button>
            </nav>
          </div>
        ) : null}
      </div>
    </section>
  );
}
