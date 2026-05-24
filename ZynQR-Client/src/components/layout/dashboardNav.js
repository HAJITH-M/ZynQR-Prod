export const navItemClass =
  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-on-surface/70 transition-all hover:bg-surface-bright hover:text-primary dark:hover:bg-white/10";

export const navItemActiveClass =
  "flex items-center gap-2.5 rounded-lg bg-surface-bright px-3 py-2 text-sm font-bold text-primary";

/** Parent dropdown trigger — neutral; only children use primary active styling. */
export const navGroupTriggerClass =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-on-surface/80 transition-all hover:bg-surface-bright hover:text-on-surface";

export const navGroupTriggerOpenClass =
  "flex w-full items-center gap-2.5 rounded-lg bg-surface-container-low/80 px-3 py-2 text-sm font-semibold text-on-surface transition-all hover:bg-surface-bright";

/** When a child route is active (same white pill as top-level active items). */
export const navGroupTriggerActiveClass =
  "flex w-full items-center gap-2.5 rounded-lg bg-surface-bright px-3 py-2 text-sm font-semibold text-on-surface transition-all hover:bg-surface-bright";

export const navSubItemClass =
  "flex items-center gap-2 rounded-lg py-2 pr-3 pl-3 text-sm font-medium text-on-surface/60 transition-all hover:bg-surface-bright hover:text-on-surface";

export const navSubItemActiveClass =
  "flex items-center gap-2 rounded-lg bg-surface-bright py-2 pr-3 pl-3 text-sm font-bold text-primary";

/** @typedef {{ to: string; label: string; icon: string; end?: boolean; activePathPrefixes?: string[] }} DashboardNavLink */

/** @typedef {{ type: "group"; label: string; icon: string; children: DashboardNavLink[] }} DashboardNavGroup */

/** Prefixes under which this link stays highlighted (e.g. create flow under Home). */
export const dashboardSidebarLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "grid_view", end: true, activePathPrefixes: ["/dashboard/create"] },
  { to: "/dashboard/my-qrs", label: "My QRs", icon: "qr_code_2" },
  { to: "/dashboard/recent-activity", label: "Recent Activity", icon: "history" },
  { to: "/dashboard/analytics", label: "Analytics", icon: "analytics" },
  { to: "/dashboard/guide", label: "User Guide", icon: "menu_book" },
  { to: "/dashboard/api-docs", label: "API Docs", icon: "api" },
  {
    type: "group",
    label: "Settings",
    icon: "tune",
    children: [
      { to: "/dashboard/account", label: "Profile", icon: "person" },
      { to: "/dashboard/security", label: "Privacy & security", icon: "shield" },
    ],
  },
  // { to: "/dashboard/notifications", label: "Notifications", icon: "notifications" },
  // { to: "/dashboard/api-keys", label: "API Keys", icon: "vpn_key" },
];

/** @param {DashboardNavLink} link @param {boolean} navIsActive @param {string} pathname */
export function isSidebarLinkActive(link, navIsActive, pathname) {
  if (navIsActive) return true;
  const prefixes = link.activePathPrefixes;
  if (!prefixes?.length) return false;
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** @param {DashboardNavGroup} group @param {string} pathname */
export function isSidebarGroupActive(group, pathname) {
  return group.children.some(
    (child) => pathname === child.to || pathname.startsWith(`${child.to}/`),
  );
}
