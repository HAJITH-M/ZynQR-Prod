/** @param {string} pathname */
export function isCreateQrPath(pathname) {
  return pathname === "/dashboard/create" || pathname.startsWith("/dashboard/create/");
}

/** @param {string} pathname */
export function isMyQrsPath(pathname) {
  return pathname === "/dashboard/my-qrs" || pathname.startsWith("/dashboard/my-qrs/");
}

/** @param {string} pathname */
export function isQrIndividualAnalyticsPath(pathname) {
  return /^\/dashboard\/my-qrs\/[^/]+\/analytics\/?$/.test(pathname);
}

/** @param {string} pathname */
export function isQrEditPath(pathname) {
  return /^\/dashboard\/my-qrs\/[^/]+\/edit\/?$/.test(pathname);
}

/** @param {string} pathname */
export function isSecurityPath(pathname) {
  return pathname === "/dashboard/security" || pathname.startsWith("/dashboard/security/");
}

/** @param {string} pathname */
export function isAnalyticsPath(pathname) {
  return pathname === "/dashboard/analytics" || pathname.startsWith("/dashboard/analytics/");
}

/** @param {string} pathname */
export function isRecentActivityPath(pathname) {
  return pathname === "/dashboard/recent-activity" || pathname.startsWith("/dashboard/recent-activity/");
}

/** @param {string} pathname */
export function isDashboardIndexPath(pathname) {
  return pathname === "/dashboard" || pathname === "/dashboard/";
}

/** @param {string} pathname */
export function isCreateStaticQrPath(pathname) {
  return pathname === "/dashboard/create-static-qr" || pathname.startsWith("/dashboard/create-static-qr/");
}

/** @param {string} pathname */
export function isStaticQrListPath(pathname) {
  return pathname === "/dashboard/static-qrs" || pathname.startsWith("/dashboard/static-qrs/");
}

/** @param {string} pathname */
export function isAccountPath(pathname) {
  return pathname === "/dashboard/account" || pathname.startsWith("/dashboard/account/");
}

/** @param {string} pathname */
export function isUserGuidePath(pathname) {
  return pathname === "/dashboard/guide" || pathname.startsWith("/dashboard/guide/");
}

/** @param {string} pathname */
export function isApiDocsPath(pathname) {
  return pathname === "/dashboard/api-docs" || pathname.startsWith("/dashboard/api-docs/");
}
