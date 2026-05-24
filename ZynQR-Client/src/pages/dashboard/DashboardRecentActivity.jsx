import { useEffect } from "react";
import { Link } from "react-router-dom";
import QrActivityTable from "../../components/dashboard/QrActivityTable";
import { useQrActivityQuery } from "../../hooks/useQrList";
import { DASHBOARD_PAGE_INSET } from "../../layouts/dashboardPageClasses";

const EMPTY_HINT =
  "No activity yet. Create a QR, edit one, or get a scan on your public /qr/<id> link — events are stored when those actions happen.";

export default function DashboardRecentActivity() {
  const {
    data: activityRows = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQrActivityQuery({ limit: 100 });

  useEffect(() => {
    const prev = document.title;
    document.title = "Recent Activity | ZynQR";
    return () => {
      document.title = prev;
    };
  }, []);

  const activityErrorMsg = isError
    ? String(error?.response?.data?.error ?? error?.message ?? "Could not load activity")
    : null;

  return (
    <div className={DASHBOARD_PAGE_INSET}>
      <nav aria-label="Breadcrumb" className="mb-6 md:hidden">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <li>
            <Link className="font-medium text-on-surface-variant hover:text-primary" to="/dashboard">
              Dashboard
            </Link>
          </li>
          <li className="text-on-surface-variant/70" aria-hidden="true">
            /
          </li>
          <li className="font-semibold text-on-surface" aria-current="page">
            Recent Activity
          </li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
          Recent Activity
        </h1>
        <p className="mt-2 max-w-xl text-on-surface-variant">
          Full timeline of scans, creates, updates, and deletes across your account.
        </p>
      </header>

      {activityErrorMsg ? (
        <div className="mb-6 rounded-2xl border border-error/20 bg-error-container/10 px-4 py-3 text-sm text-on-surface">
          <span className="font-semibold">Could not load activity.</span> {activityErrorMsg}{" "}
          <button className="font-bold text-primary underline" type="button" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      ) : null}

      <QrActivityTable items={activityRows} loading={isLoading} emptyHint={EMPTY_HINT} />

      {/* <p className="mt-6 text-center text-sm text-on-surface-variant">
        <Link className="font-bold text-primary hover:underline" to="/dashboard">
          ← Back to dashboard
        </Link>
      </p> */}
    </div>
  );
}
