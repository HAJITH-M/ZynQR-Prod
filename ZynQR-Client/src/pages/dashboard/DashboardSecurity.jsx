import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UAParser } from "ua-parser-js";
import { clearAuthToken } from "../../api/axiosInstance";
import {
  deleteAccount,
  fetchAuthMe,
  fetchAuthSessions,
  fetchSecurityAuditLog,
  logoutAllSessions,
  logoutCurrentSession,
  revokeAuthSession,
  updateTwoFactor,
} from "../../api/auth.api";
import { formatActivityDateTime, formatRelativeTime } from "../../utils/formatRelativeTime";
import { toast, toastApiError, toastWarning } from "../../utils/toast";
import DeleteAccountConfirmModal from "../../components/dashboard/DeleteAccountConfirmModal";
import { DASHBOARD_PAGE_INSET } from "../../layouts/dashboardPageClasses";

const QUERY_SESSIONS = ["auth", "sessions"];
const QUERY_AUDIT = ["auth", "security-audit-log"];
const QUERY_ME = ["auth", "me"];

const SESSIONS_PAGE_SIZE = 5;
const AUDIT_PAGE_SIZE = 7;

const sessionsPagerBtn =
  "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-2 text-sm font-bold text-on-surface transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface-container-lowest";

/** @param {string} [deviceInfo] */
function sessionDevicePresentation(deviceInfo) {
  if (!deviceInfo?.trim()) return { title: "Unknown device", icon: "devices" };
  const p = new UAParser(deviceInfo).getResult();
  const type = p.device.type;
  let icon = "laptop_mac";
  if (type === "tablet") icon = "tablet";
  else if (type === "mobile") icon = "smartphone";
  const br = [p.browser.name, p.os.name].filter(Boolean).join(" · ");
  const title = br || deviceInfo.slice(0, 80);
  return { title, icon };
}

const AUDIT_EVENT_META = {
  login: { label: "User login", icon: "login", iconClass: "text-primary" },
  login_failed: { label: "Failed login attempt", icon: "no_accounts", iconClass: "text-error" },
  oauth_login: { label: "Google sign-in", icon: "account_circle", iconClass: "text-primary" },
  logout: { label: "Logout (this device)", icon: "logout", iconClass: "text-on-surface-variant" },
  logout_all: { label: "Logout all sessions", icon: "logout", iconClass: "text-tertiary" },
  password_change: { label: "Password changed", icon: "password", iconClass: "text-tertiary" },
  password_reset: { label: "Password reset", icon: "lock_reset", iconClass: "text-tertiary" },
  session_revoke: { label: "Session revoked", icon: "phonelink_off", iconClass: "text-secondary" },
};

/** @param {{ event_type: string }} row */
function auditRowPresentation(row) {
  const meta = AUDIT_EVENT_META[row.event_type] ?? {
    label: row.event_type.replace(/_/g, " "),
    icon: "info",
    iconClass: "text-on-surface-variant",
  };
  const ok = (row.status || "").toLowerCase() === "success";
  return {
    ...meta,
    status: ok ? "SUCCESS" : "FAILED",
    statusClass: ok ? "bg-green-100 text-green-800" : "bg-error-container text-error",
  };
}

export default function DashboardSecurity() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLogoutCurrentPending, setIsLogoutCurrentPending] = useState(false);
  const [isLogoutAllPending, setIsLogoutAllPending] = useState(false);
  const [auditFilter, setAuditFilter] = useState("all");
  const [sessionsPage, setSessionsPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [sessionLogoutMenuOpen, setSessionLogoutMenuOpen] = useState(false);
  const sessionLogoutMenuRef = useRef(null);

  const {
    data: mePayload,
    isLoading: meLoading,
    isError: meError,
    error: meErr,
    refetch: refetchMe,
  } = useQuery({
    queryKey: QUERY_ME,
    queryFn: fetchAuthMe,
  });

  const twoFactorEnabled = Boolean(mePayload?.two_factor_enabled);

  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteAccount("delete"),
    onSuccess: () => {
      setDeleteAccountOpen(false);
      clearAuthToken();
      localStorage.removeItem("email");
      queryClient.clear();
      navigate("/login", { replace: true });
    },
    onError: (err) => {
      toastApiError(err, "Could not delete account");
    },
  });

  const twoFactorMutation = useMutation({
    mutationFn: (enabled) => updateTwoFactor(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_ME });
    },
    onError: (err) => {
      const msg = err?.response?.data?.error ?? err?.message ?? "Could not update 2FA";
      toast.error(String(msg));
      queryClient.invalidateQueries({ queryKey: QUERY_ME });
    },
  });

  const {
    data: sessionsPayload,
    isLoading: sessionsLoading,
    isError: sessionsError,
    error: sessionsErr,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: QUERY_SESSIONS,
    queryFn: fetchAuthSessions,
  });

  const {
    data: auditPayload,
    isLoading: auditLoading,
    isError: auditError,
    error: auditErr,
    refetch: refetchAudit,
  } = useQuery({
    queryKey: QUERY_AUDIT,
    queryFn: fetchSecurityAuditLog,
  });

  const sessions = sessionsPayload?.sessions ?? [];

  const totalSessionPages = Math.max(1, Math.ceil(sessions.length / SESSIONS_PAGE_SIZE) || 1);
  const effectiveSessionsPage = Math.min(Math.max(1, sessionsPage), totalSessionPages);

  useEffect(() => {
    setSessionsPage((p) => Math.min(p, totalSessionPages));
  }, [totalSessionPages]);

  const pagedSessions = useMemo(() => {
    const start = (effectiveSessionsPage - 1) * SESSIONS_PAGE_SIZE;
    return sessions.slice(start, start + SESSIONS_PAGE_SIZE);
  }, [sessions, effectiveSessionsPage]);

  const sessionRangeStart =
    sessions.length === 0 ? 0 : (effectiveSessionsPage - 1) * SESSIONS_PAGE_SIZE + 1;
  const sessionRangeEnd =
    sessions.length === 0
      ? 0
      : Math.min(effectiveSessionsPage * SESSIONS_PAGE_SIZE, sessions.length);

  const filteredAudit = useMemo(() => {
    const rows = auditPayload?.logs ?? [];
    if (auditFilter === "success") return rows.filter((r) => (r.status || "").toLowerCase() === "success");
    if (auditFilter === "failed") return rows.filter((r) => (r.status || "").toLowerCase() === "failed");
    return rows;
  }, [auditPayload, auditFilter]);

  const totalAuditPages = Math.max(1, Math.ceil(filteredAudit.length / AUDIT_PAGE_SIZE) || 1);
  const effectiveAuditPage = Math.min(Math.max(1, auditPage), totalAuditPages);

  useEffect(() => {
    setAuditPage(1);
  }, [auditFilter]);

  useEffect(() => {
    setAuditPage((p) => Math.min(p, totalAuditPages));
  }, [totalAuditPages]);

  const pagedAudit = useMemo(() => {
    const start = (effectiveAuditPage - 1) * AUDIT_PAGE_SIZE;
    return filteredAudit.slice(start, start + AUDIT_PAGE_SIZE);
  }, [filteredAudit, effectiveAuditPage]);

  const auditRangeStart =
    filteredAudit.length === 0 ? 0 : (effectiveAuditPage - 1) * AUDIT_PAGE_SIZE + 1;
  const auditRangeEnd =
    filteredAudit.length === 0
      ? 0
      : Math.min(effectiveAuditPage * AUDIT_PAGE_SIZE, filteredAudit.length);

  const revokeMutation = useMutation({
    mutationFn: (sessionId) => revokeAuthSession(sessionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_SESSIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_AUDIT });
      if (data?.revoked_current) {
        clearAuthToken();
        localStorage.removeItem("email");
        window.location.assign("/login");
      }
    },
  });

  useEffect(() => {
    const prev = document.title;
    document.title = "Security & Privacy | ZynQR";
    return () => {
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    if (!sessionLogoutMenuOpen) return;
    function onPointerDown(e) {
      const el = sessionLogoutMenuRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setSessionLogoutMenuOpen(false);
      }
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setSessionLogoutMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sessionLogoutMenuOpen]);

  useEffect(() => {
    if (isLogoutCurrentPending || isLogoutAllPending) {
      setSessionLogoutMenuOpen(false);
    }
  }, [isLogoutCurrentPending, isLogoutAllPending]);

  async function handleLogoutCurrentSession() {
    if (isLogoutCurrentPending || isLogoutAllPending) return;
    setIsLogoutCurrentPending(true);
    let logoutFailed = false;
    try {
      await logoutCurrentSession();
    } catch {
      logoutFailed = true;
    } finally {
      if (logoutFailed) {
        toastWarning("Could not revoke current server session. You were logged out locally only.");
      }
      clearAuthToken();
      localStorage.removeItem("email");
      window.location.assign("/login");
    }
  }

  async function handleLogoutAllSessions() {
    if (isLogoutCurrentPending || isLogoutAllPending) return;
    setIsLogoutAllPending(true);
    let logoutFailed = false;
    try {
      await logoutAllSessions();
    } catch {
      logoutFailed = true;
    } finally {
      if (logoutFailed) {
        toastWarning("Could not revoke all server sessions. You were logged out locally only.");
      }
      clearAuthToken();
      localStorage.removeItem("email");
      window.location.assign("/login");
    }
  }

  function exportAuditCsv() {
    const header = ["event_type", "event", "status", "ip_address", "created_at"];
    const lines = [header.join(",")];
    for (const row of filteredAudit) {
      const pres = auditRowPresentation(row);
      const cells = [
        row.event_type,
        `"${String(pres.label).replace(/"/g, '""')}"`,
        row.status,
        row.ip_address ?? "",
        row.created_at ?? "",
      ];
      lines.push(cells.join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const sessionsErrorMsg = sessionsError
    ? String(sessionsErr?.response?.data?.error ?? sessionsErr?.message ?? "Could not load sessions")
    : null;
  const auditErrorMsg = auditError
    ? String(auditErr?.response?.data?.error ?? auditErr?.message ?? "Could not load audit log")
    : null;

  return (
    <div className={`relative ${DASHBOARD_PAGE_INSET}`}>
      <nav aria-label="Breadcrumb" className="mb-8 md:hidden">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <li>
            <Link
              className="font-medium text-on-surface-variant transition-colors hover:text-primary"
              to="/dashboard"
            >
              Dashboard
            </Link>
          </li>
          <li className="select-none text-on-surface-variant/70" aria-hidden="true">
            /
          </li>
          <li className="font-semibold text-on-surface" aria-current="page">
            {"Security & Privacy"}
          </li>
        </ol>
      </nav>

      <header className="mb-10 md:mb-12">
        <h1 className="font-headline mb-2 text-4xl font-extrabold tracking-tight text-on-surface">
          {"Security & Privacy"}
        </h1>
        <p className="max-w-2xl text-on-surface-variant">
          Manage your account authentication methods, review active sessions, and configure data privacy preferences
          to keep your enterprise data safe. To change your password, open{" "}
          <Link className="font-semibold text-primary underline-offset-2 hover:underline" to="/dashboard/account">
            Account Settings
          </Link>
          .
        </p>
        <p className="mt-3 max-w-2xl text-sm text-on-surface-variant">
          Review <strong className="text-on-surface">active sessions</strong> and{" "}
          <strong className="text-on-surface">security audit logs</strong> below. When two-factor is on, password sign-in
          sends a one-time code to your email before you are signed in. Google sign-in is unchanged.
        </p>
      </header>

      <div className="grid grid-cols-12 items-start gap-8">
        {/* Two-Factor Authentication */}
        <section className="col-span-12 flex flex-col gap-6 rounded-3xl bg-surface-container-low p-8 lg:col-span-5">
          <div>
            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container shadow-lg shadow-primary-container/20">
                <span
                  className="material-symbols-outlined text-3xl text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  vibration
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="mb-1 text-[10px] font-bold tracking-widest text-on-surface-variant/60 uppercase">
                  Status
                </span>
                <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                  <span className="h-1.5 w-1.5 animate-ZynQR rounded-full bg-green-600" />
                  Active
                </div>
              </div>
            </div>
            <h2 className="font-headline mb-3 text-2xl font-bold tracking-tight text-on-surface">
              Two-Factor Authentication
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-on-surface-variant">
              When enabled, signing in with email and password sends a one-time code to your inbox; you must enter it before access is granted.
            </p>
            {meError ? (
              <p className="mb-4 text-sm text-error">
                Could not load account settings.{" "}
                <button className="font-bold underline" type="button" onClick={() => refetchMe()}>
                  Retry
                </button>{" "}
                {String(meErr?.response?.data?.error ?? meErr?.message ?? "")}
              </p>
            ) : null}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-surface-container-lowest p-4">
              <span className="text-sm font-semibold text-on-surface">
                {meLoading ? "Loading…" : `2FA is ${twoFactorEnabled ? "enabled" : "disabled"}`}
              </span>
              <label className={`relative inline-flex items-center ${meLoading || twoFactorMutation.isPending ? "cursor-wait opacity-70" : "cursor-pointer"}`}>
                <input
                  checked={twoFactorEnabled}
                  disabled={meLoading || meError || twoFactorMutation.isPending}
                  className="peer sr-only"
                  type="checkbox"
                  onChange={(e) => twoFactorMutation.mutate(e.target.checked)}
                />
                <div className="relative h-6 w-11 shrink-0 rounded-full bg-surface-container-high transition-colors after:pointer-events-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-transform after:content-[''] peer-checked:bg-primary-container peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-container/50 peer-disabled:opacity-50" />
              </label>
            </div>
          </div>
        </section>

        {/* Active Sessions */}
        <section className="col-span-12 rounded-3xl bg-surface-container-low p-8 lg:col-span-7">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Active Sessions</h2>
            <div className="relative w-full sm:ml-auto sm:w-auto" ref={sessionLogoutMenuRef}>
              <button
                aria-controls="session-logout-menu"
                aria-expanded={sessionLogoutMenuOpen}
                aria-haspopup="true"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-lowest px-4 py-2.5 text-sm font-semibold text-on-surface shadow-sm transition-colors hover:border-primary/45 hover:bg-primary-container/10 hover:text-primary disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                disabled={isLogoutCurrentPending || isLogoutAllPending}
                id="session-logout-trigger"
                type="button"
                onClick={() => setSessionLogoutMenuOpen((o) => !o)}
              >
                <span className="material-symbols-outlined shrink-0 text-[20px] text-primary" aria-hidden>
                  logout
                </span>
                {isLogoutCurrentPending || isLogoutAllPending ? "Signing out…" : "Logout"}
                <span
                  className={`material-symbols-outlined shrink-0 text-[20px] text-on-surface-variant transition-transform duration-200 ${sessionLogoutMenuOpen ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  expand_more
                </span>
              </button>
              {sessionLogoutMenuOpen ? (
                <div
                  className="absolute top-full right-0 z-50 mt-2 w-full max-w-sm overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest py-1 shadow-lg ring-1 ring-black/5 sm:min-w-[18rem] sm:max-w-none"
                  id="session-logout-menu"
                  role="menu"
                  aria-labelledby="session-logout-trigger"
                >
                  <button
                    className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-50"
                    role="menuitem"
                    type="button"
                    disabled={isLogoutCurrentPending || isLogoutAllPending}
                    onClick={() => {
                      setSessionLogoutMenuOpen(false);
                      void handleLogoutCurrentSession();
                    }}
                  >
                    <span className="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-primary" aria-hidden>
                      logout
                    </span>
                    <span className="min-w-0">
                      <span className="block">Logout current session</span>
                      <span className="mt-0.5 block text-xs font-normal text-on-surface-variant">
                        Sign out only on this browser
                      </span>
                    </span>
                  </button>
                  <div className="mx-2 border-t border-outline-variant/20" role="separator" />
                  <button
                    className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm font-semibold text-error transition-colors hover:bg-error-container/12 disabled:pointer-events-none disabled:opacity-50"
                    role="menuitem"
                    type="button"
                    disabled={isLogoutCurrentPending || isLogoutAllPending}
                    onClick={() => {
                      setSessionLogoutMenuOpen(false);
                      void handleLogoutAllSessions();
                    }}
                  >
                    <span className="material-symbols-outlined mt-0.5 shrink-0 text-[20px]" aria-hidden>
                      group_off
                    </span>
                    <span className="min-w-0">
                      <span className="block">Logout all sessions</span>
                      <span className="mt-0.5 block text-xs font-normal text-error/80">
                        Sign out on every device
                      </span>
                    </span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          {sessionsErrorMsg ? (
            <div className="mb-4 rounded-xl border border-error/20 bg-error-container/10 px-4 py-2 text-sm text-on-surface">
              {sessionsErrorMsg}{" "}
              <button className="font-bold text-primary underline" type="button" onClick={() => refetchSessions()}>
                Retry
              </button>
            </div>
          ) : null}
          <div className="space-y-4">
            {sessionsLoading ? (
              <p className="text-sm text-on-surface-variant">Loading sessions…</p>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No active sessions found.</p>
            ) : (
              pagedSessions.map((s) => {
                const { title, icon } = sessionDevicePresentation(s.device_info);
                const metaBits = [s.ip_address].filter(Boolean);
                const meta = metaBits.join(" · ") || "—";
                const isCurrent = Boolean(s.is_current);
                return (
                  <div
                    key={s.session_id}
                    className="flex flex-col gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container">
                        <span className="material-symbols-outlined text-on-surface-variant">{icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{title}</p>
                        <p className="text-xs text-on-surface-variant">{meta}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                      {isCurrent ? (
                        <>
                          <span className="rounded-full bg-primary-fixed px-2 py-0.5 text-[10px] font-bold text-primary w-fit">
                            Current Session
                          </span>
                          <span className="text-xs text-on-surface-variant sm:text-right">Active now</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-on-surface-variant sm:text-right">
                            Last active {formatRelativeTime(s.last_seen_at)}
                          </span>
                          <button
                            className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-error/25 bg-surface-container-lowest px-3 py-2 text-xs font-bold text-error transition-colors hover:bg-error-container/15 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
                            type="button"
                            aria-label={`Log out session ${title}`}
                            disabled={revokeMutation.isPending}
                            onClick={() => revokeMutation.mutate(s.session_id)}
                          >
                            <span className="material-symbols-outlined text-base leading-none">logout</span>
                            Log out
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {!sessionsLoading && sessions.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-outline-variant/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-on-surface-variant">
                Showing{" "}
                <span className="font-semibold text-on-surface">
                  {sessionRangeStart}–{sessionRangeEnd}
                </span>{" "}
                of <span className="font-semibold text-on-surface">{sessions.length}</span> sessions
              </p>
              <nav className="flex flex-wrap items-center gap-1" aria-label="Sessions pages">
                <button
                  type="button"
                  className={sessionsPagerBtn}
                  aria-label="First page"
                  disabled={effectiveSessionsPage <= 1}
                  onClick={() => setSessionsPage(1)}
                >
                  {"<<"}
                </button>
                <button
                  type="button"
                  className={sessionsPagerBtn}
                  aria-label="Previous page"
                  disabled={effectiveSessionsPage <= 1}
                  onClick={() => setSessionsPage((p) => Math.max(1, p - 1))}
                >
                  {"<"}
                </button>
                <span
                  className="min-w-18 px-2 text-center text-xs font-black tabular-nums text-on-surface"
                  aria-current="page"
                >
                  {effectiveSessionsPage} / {totalSessionPages}
                </span>
                <button
                  type="button"
                  className={sessionsPagerBtn}
                  aria-label="Next page"
                  disabled={effectiveSessionsPage >= totalSessionPages}
                  onClick={() => setSessionsPage((p) => Math.min(totalSessionPages, p + 1))}
                >
                  {">"}
                </button>
                <button
                  type="button"
                  className={sessionsPagerBtn}
                  aria-label="Last page"
                  disabled={effectiveSessionsPage >= totalSessionPages}
                  onClick={() => setSessionsPage(totalSessionPages)}
                >
                  {">>"}
                </button>
              </nav>
            </div>
          ) : null}
          {revokeMutation.isError ? (
            <p className="mt-3 text-xs text-error">
              {String(revokeMutation.error?.response?.data?.error ?? revokeMutation.error?.message ?? "Revoke failed")}
            </p>
          ) : null}
        </section>

        {/* Security Audit Logs */}
        <section className="col-span-12 rounded-3xl bg-surface-container-low p-8 lg:col-span-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Security Audit Logs</h2>
            <div className="flex flex-wrap gap-2">
              <button
                className={
                  auditFilter === "all"
                    ? "flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-xs font-bold text-primary"
                    : "flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-xs font-bold transition-all hover:bg-surface-variant"
                }
                type="button"
                onClick={() => setAuditFilter("all")}
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                All
              </button>
              <button
                className={
                  auditFilter === "success"
                    ? "flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-xs font-bold text-primary"
                    : "flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-xs font-bold transition-all hover:bg-surface-variant"
                }
                type="button"
                onClick={() => setAuditFilter("success")}
              >
                Success
              </button>
              <button
                className={
                  auditFilter === "failed"
                    ? "flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-xs font-bold text-primary"
                    : "flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-xs font-bold transition-all hover:bg-surface-variant"
                }
                type="button"
                onClick={() => setAuditFilter("failed")}
              >
                Failed
              </button>
              <button
                className="flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-xs font-bold transition-all hover:bg-surface-variant disabled:opacity-50"
                type="button"
                disabled={filteredAudit.length === 0}
                onClick={exportAuditCsv}
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Export CSV
              </button>
            </div>
          </div>
          {auditErrorMsg ? (
            <div className="mb-4 rounded-xl border border-error/20 bg-error-container/10 px-4 py-2 text-sm text-on-surface">
              {auditErrorMsg}{" "}
              <button className="font-bold text-primary underline" type="button" onClick={() => refetchAudit()}>
                Retry
              </button>
            </div>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-outline-variant/10 text-left text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                  <th className="px-2 pb-4">Event</th>
                  <th className="px-2 pb-4">Status</th>
                  <th className="px-2 pb-4">IP Address</th>
                  <th className="px-2 pb-4 text-right">Date &amp; Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {auditLoading ? (
                  <tr>
                    <td className="px-2 py-6 text-sm text-on-surface-variant" colSpan={4}>
                      Loading audit log…
                    </td>
                  </tr>
                ) : filteredAudit.length === 0 ? (
                  <tr>
                    <td className="px-2 py-6 text-sm text-on-surface-variant" colSpan={4}>
                      No audit events yet. Sign in, change password, or revoke a session to populate this log.
                    </td>
                  </tr>
                ) : (
                  pagedAudit.map((row) => {
                    const pres = auditRowPresentation(row);
                    return (
                      <tr key={row.id} className="transition-colors hover:bg-surface-container-highest/50">
                        <td className="px-2 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined text-lg ${pres.iconClass}`}>{pres.icon}</span>
                            <span className="text-sm font-semibold text-on-surface">{pres.label}</span>
                          </div>
                        </td>
                        <td className="px-2 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${pres.statusClass}`}
                          >
                            {pres.status}
                          </span>
                        </td>
                        <td className="px-2 py-4 font-mono text-sm text-on-surface-variant">{row.ip_address || "—"}</td>
                        <td className="px-2 py-4 text-right text-sm text-on-surface-variant">
                          {formatActivityDateTime(row.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {!auditLoading && filteredAudit.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-outline-variant/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-on-surface-variant">
                Showing{" "}
                <span className="font-semibold text-on-surface">
                  {auditRangeStart}–{auditRangeEnd}
                </span>{" "}
                of <span className="font-semibold text-on-surface">{filteredAudit.length}</span> events
              </p>
              <nav className="flex flex-wrap items-center gap-1" aria-label="Audit log pages">
                <button
                  type="button"
                  className={sessionsPagerBtn}
                  aria-label="First page"
                  disabled={effectiveAuditPage <= 1}
                  onClick={() => setAuditPage(1)}
                >
                  {"<<"}
                </button>
                <button
                  type="button"
                  className={sessionsPagerBtn}
                  aria-label="Previous page"
                  disabled={effectiveAuditPage <= 1}
                  onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                >
                  {"<"}
                </button>
                <span
                  className="min-w-18 px-2 text-center text-xs font-black tabular-nums text-on-surface"
                  aria-current="page"
                >
                  {effectiveAuditPage} / {totalAuditPages}
                </span>
                <button
                  type="button"
                  className={sessionsPagerBtn}
                  aria-label="Next page"
                  disabled={effectiveAuditPage >= totalAuditPages}
                  onClick={() => setAuditPage((p) => Math.min(totalAuditPages, p + 1))}
                >
                  {">"}
                </button>
                <button
                  type="button"
                  className={sessionsPagerBtn}
                  aria-label="Last page"
                  disabled={effectiveAuditPage >= totalAuditPages}
                  onClick={() => setAuditPage(totalAuditPages)}
                >
                  {">>"}
                </button>
              </nav>
            </div>
          ) : null}
        </section>

        {/* Data Privacy */}
        <section className="relative col-span-12 flex flex-col justify-between overflow-hidden rounded-3xl bg-on-surface p-8 text-surface-bright lg:col-span-4">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-primary-container opacity-20 blur-[80px]" />
          <div className="relative z-10">
            <h2 className="font-headline mb-3 text-2xl font-bold tracking-tight">Data Privacy</h2>
            <p className="mb-8 text-sm leading-relaxed text-surface-bright/60">
              Control your personal data. You can download a complete archive of your activity or permanently close
              your account.
            </p>
            <div className="space-y-4">
              <button
                className="group w-full cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition-all hover:bg-white/10"
                type="button"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-bold">Download My Data</h3>
                  <span className="material-symbols-outlined text-primary-container">file_download</span>
                </div>
                <p className="text-[11px] text-surface-bright/40">
                  Includes all logs, configurations, and personal profile information in JSON format.
                </p>
              </button>
              <button
                className="group w-full cursor-pointer rounded-2xl border border-error/20 bg-error/10 p-5 text-left transition-all hover:bg-error/20"
                type="button"
                onClick={() => setDeleteAccountOpen(true)}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-error">Delete Account</h3>
                  <span className="material-symbols-outlined text-error">delete_forever</span>
                </div>
                <p className="text-[11px] text-error/70">
                  Warning: This action is permanent and cannot be undone. All data will be wiped.
                </p>
              </button>
            </div>
          </div>
          <div className="relative z-10 mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-[10px] font-bold tracking-widest text-surface-bright/30 uppercase sm:flex-row sm:items-center sm:justify-between">
            <span>Privacy Policy</span>
            <span>Compliance: GDPR &amp; CCPA</span>
          </div>
        </section>
      </div>

      <div className="pointer-events-none fixed bottom-0 left-0 z-0 h-1 w-full bg-linear-to-r from-transparent via-primary-container to-transparent opacity-20 blur-sm" />

      <DeleteAccountConfirmModal
        open={deleteAccountOpen}
        accountEmail={mePayload?.email}
        pending={deleteAccountMutation.isPending}
        onClose={() => !deleteAccountMutation.isPending && setDeleteAccountOpen(false)}
        onConfirm={() => deleteAccountMutation.mutate()}
      />
    </div>
  );
}
