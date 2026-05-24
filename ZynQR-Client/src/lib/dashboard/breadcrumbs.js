import {
  isAccountPath,
  isAnalyticsPath,
  isCreateQrPath,
  isCreateStaticQrPath,
  isDashboardIndexPath,
  isMyQrsPath,
  isQrEditPath,
  isQrIndividualAnalyticsPath,
  isRecentActivityPath,
  isSecurityPath,
  isStaticQrListPath,
  isApiDocsPath,
  isUserGuidePath,
} from "./routes.js";

/**
 * @typedef {{ label: string; to?: string; current?: boolean; title?: string; truncate?: boolean }} DashboardBreadcrumbSegment
 */

/** @param {Array<{ id: string; name?: string }> | undefined} rows @param {string | undefined} qrId */
export function qrBreadcrumbTitleFromList(rows, qrId) {
  if (!qrId) return "QR Code";
  const hit = rows?.find((r) => r.id === qrId);
  return hit?.name ?? "QR Code";
}

/**
 * @param {string} pathname
 * @param {{ editQrId?: string; analyticsQrId?: string; editTitle?: string; analyticsTitle?: string }} ctx
 * @returns {DashboardBreadcrumbSegment[] | null} null = hide breadcrumb nav
 */
export function resolveDashboardBreadcrumbs(pathname, ctx) {
  const dash = { label: "Dashboard", to: "/dashboard" };
  const dashOnly = [{ label: "Dashboard", current: true }];

  if (isCreateQrPath(pathname)) {
    return [dash, { label: "Create QR", current: true }];
  }
  if (isQrEditPath(pathname) && ctx.editQrId) {
    const title = ctx.editTitle ?? "QR Code";
    return [
      dash,
      { label: "My QRs", to: "/dashboard/my-qrs" },
      {
        label: `Edit · ${title}`,
        current: true,
        title,
        truncate: true,
      },
    ];
  }
  if (isQrIndividualAnalyticsPath(pathname) && ctx.analyticsQrId) {
    const title = ctx.analyticsTitle ?? "QR Code";
    return [
      dash,
      { label: "My QRs", to: "/dashboard/my-qrs" },
      { label: title, current: true, title, truncate: true },
    ];
  }
  if (isMyQrsPath(pathname)) {
    return [dash, { label: "My QRs", current: true }];
  }
  if (isRecentActivityPath(pathname)) {
    return [dash, { label: "Recent Activity", current: true }];
  }
  if (isSecurityPath(pathname)) {
    return [dash, { label: "Privacy & security", current: true }];
  }
  if (isAnalyticsPath(pathname)) {
    return [dash, { label: "Global Analytics", current: true }];
  }
  if (isDashboardIndexPath(pathname)) {
    return dashOnly;
  }
  if (isCreateStaticQrPath(pathname)) {
    return [dash, { label: "Create static QR", current: true }];
  }
  if (isStaticQrListPath(pathname)) {
    return [dash, { label: "Static QR codes", current: true }];
  }
  if (isAccountPath(pathname)) {
    return [dash, { label: "Profile", current: true }];
  }
  if (isUserGuidePath(pathname)) {
    return [dash, { label: "User Guide", current: true }];
  }
  if (isApiDocsPath(pathname)) {
    return [dash, { label: "API Documentation", current: true }];
  }
  return dashOnly;
}
