import { useEffect, useMemo, useState } from "react";
import { sliceClientPage } from "../../lib/dashboard/pagination";

/**
 * In-component pagination over a full list (e.g. activity table).
 * @param {unknown[]} items
 * @param {number} pageSize
 */
export function useClientPagination(items, pageSize) {
  const [page, setPage] = useState(1);

  const { totalPages, effectivePage, pagedItems, rangeStart, rangeEnd } = useMemo(
    () => sliceClientPage(items, page, pageSize),
    [items, page, pageSize]
  );

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  return {
    page,
    setPage,
    totalPages,
    effectivePage,
    pagedItems,
    rangeStart,
    rangeEnd,
  };
}
