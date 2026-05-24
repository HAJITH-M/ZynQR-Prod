import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteStaticQr, fetchStaticQrList } from "../../api/staticQr.api";
import { STATIC_QR_LIST_QUERY_KEY } from "../../hooks/useQrList";
import { DASHBOARD_PAGE_SHELL } from "../../layouts/dashboardPageClasses";
import { toastApiError } from "../../utils/toast";

export default function DashboardStaticQrList() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: STATIC_QR_LIST_QUERY_KEY,
    queryFn: fetchStaticQrList,
  });

  const del = useMutation({
    mutationFn: (id) => deleteStaticQr(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STATIC_QR_LIST_QUERY_KEY }),
    onError: (e) => toastApiError(e, "Delete failed"),
  });

  useEffect(() => {
    const prev = document.title;
    document.title = "Static QR codes — ZynQR";
    return () => {
      document.title = prev;
    };
  }, []);

  const items = data?.items ?? [];
  const errMsg = isError ? String(error?.response?.data?.error ?? error?.message ?? "Load failed") : null;

  return (
    <div className={DASHBOARD_PAGE_SHELL}>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Static QR codes</h1>
          <p className="mt-2 max-w-xl text-on-surface-variant">
            Direct-encoded images only — no per-scan analytics. For tracked links and dashboards, use{" "}
            <Link className="font-bold text-primary hover:underline" to="/dashboard/create">
              dynamic QR
            </Link>
            .
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 hover:bg-primary-container"
          to="/dashboard/create-static-qr"
        >
          New static QR
        </Link>
      </div>

      {errMsg ? (
        <div className="mb-4 rounded-xl border border-error/20 bg-error-container/10 px-4 py-3 text-sm">
          {errMsg}{" "}
          <button className="font-bold text-primary underline" type="button" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-on-surface-variant">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-on-surface-variant">
          No static codes yet.{" "}
          <Link className="font-bold text-primary underline" to="/dashboard/create-static-qr">
            Create one
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-sm sm:flex-row sm:items-center"
            >
              {row.image_data_url ? (
                <img
                  alt=""
                  className="h-24 w-24 shrink-0 rounded-lg border border-outline-variant/20 bg-white object-contain p-1"
                  src={row.image_data_url}
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <h2 className="font-headline font-bold text-on-surface">{row.name}</h2>
                <p className="mt-1 truncate font-mono text-sm text-on-surface-variant">{row.encoded_payload}</p>
              </div>
              <button
                className="shrink-0 rounded-full border border-error/30 px-4 py-2 text-sm font-bold text-error hover:bg-error/10 disabled:opacity-50"
                disabled={del.isPending}
                type="button"
                onClick={() => {
                  if (window.confirm("Delete this static QR?")) del.mutate(row.id);
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
