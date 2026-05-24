/**
 * @param {number} page
 * @param {number} totalPages
 */
export function clampPage(page, totalPages) {
  if (totalPages < 1) return 1;
  return Math.min(Math.max(1, page), totalPages);
}

/**
 * @param {number} totalCount
 * @param {number} pageSize
 */
export function totalPagesFromCount(totalCount, pageSize) {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}

/**
 * Server-driven table footer range (page is controlled by parent).
 * @param {{ totalCount: number; page: number; pageSize: number }} params
 */
export function getServerPagination({ totalCount, page, pageSize }) {
  const totalPages = totalPagesFromCount(totalCount, pageSize);
  const safePage = clampPage(page, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = totalCount === 0 ? 0 : Math.min(safePage * pageSize, totalCount);
  return { totalPages, safePage, rangeStart, rangeEnd };
}

/**
 * Client-side slice for a full in-memory list.
 * @param {unknown[]} items
 * @param {number} page
 * @param {number} pageSize
 */
export function sliceClientPage(items, page, pageSize) {
  const totalPages = totalPagesFromCount(items.length, pageSize);
  const effectivePage = clampPage(page, totalPages);
  const start = (effectivePage - 1) * pageSize;
  return {
    totalPages,
    effectivePage,
    pagedItems: items.slice(start, start + pageSize),
    rangeStart: items.length === 0 ? 0 : start + 1,
    rangeEnd: items.length === 0 ? 0 : Math.min(effectivePage * pageSize, items.length),
  };
}

/**
 * Pad table body with empty rows for consistent height.
 * @param {number} rowCount
 * @param {number} pageSize
 */
export function tableSpacerRowCount(rowCount, pageSize) {
  return Math.max(0, pageSize - rowCount);
}
