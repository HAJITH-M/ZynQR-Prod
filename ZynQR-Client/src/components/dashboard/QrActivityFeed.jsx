import { formatActivityDateTime, formatRelativeTime } from "../../utils/formatRelativeTime";
import { scanQrDisplayName } from "../../lib/dashboard/activity";

/**
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
 *     userAgent?: string;
 *     createdAt: string;
 *     icon: string;
 *     iconWrap: string;
 *   }>;
 *   loading?: boolean;
 *   emptyHint: string;
 * }} props
 */
export default function QrActivityFeed({ items, loading = false, emptyHint }) {
  if (loading) {
    return <p className="px-2 py-6 text-center text-sm text-on-surface-variant">Loading activity…</p>;
  }
  if (!items.length) {
    return <p className="px-2 py-6 text-center text-sm text-on-surface-variant">{emptyHint}</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <ActivityFeedRow key={item.id} item={item} />
      ))}
    </div>
  );
}

function ActivityFeedRow({ item }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl p-4 even:bg-surface-container-lowest odd:bg-surface-container-low">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.iconWrap}`}>
        <span className="material-symbols-outlined">{item.icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-on-surface">{item.title}</p>
        {item.eventType === "scan" ? (
          <>
            <p className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs leading-snug">
              <span className="font-semibold text-on-surface">{scanQrDisplayName(item)}</span>
              <span className="text-on-surface-variant/60" aria-hidden>
                ·
              </span>
              <span className="font-semibold text-primary">
                1 scan · {formatActivityDateTime(item.createdAt)}
              </span>
            </p>
            {(item.city || item.country || item.clientIp) ? (
              <p className="mt-0.5 truncate text-[11px] text-on-surface-variant/90">
                {[item.city, item.country].filter(Boolean).join(", ") || "Approx. location unknown"}
                {item.clientIp ? ` · ${item.clientIp}` : ""}
              </p>
            ) : null}
          </>
        ) : (
          <p className="truncate text-xs text-on-surface-variant">{item.detail}</p>
        )}
      </div>
      <span className="shrink-0 text-[11px] font-medium text-slate-400">
        {formatRelativeTime(item.createdAt)}
      </span>
    </div>
  );
}
