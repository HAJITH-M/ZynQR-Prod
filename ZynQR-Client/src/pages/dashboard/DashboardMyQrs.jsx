import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import QrCodeDeleteConfirmModal from "../../components/dashboard/QrCodeDeleteConfirmModal";
import QrCodesTable from "../../components/dashboard/QrCodesTable";
import StaticQrCodesTable from "../../components/dashboard/StaticQrCodesTable";
import TextField from "../../components/ui/TextField";
import { deleteQr } from "../../api/qr.api";
import { deleteStaticQr } from "../../api/staticQr.api";
import {
  QR_ACTIVITY_QUERY_KEY,
  QR_ANALYTICS_SUMMARY_QUERY_KEY,
  QR_LIST_QUERY_KEY,
  STATIC_QR_LIST_QUERY_KEY,
  useQrListQuery,
  useStaticQrListQuery,
} from "../../hooks/useQrList";
import { DASHBOARD_PAGE_INSET } from "../../layouts/dashboardPageClasses";
import { toastApiError } from "../../utils/toast";

const PAGE_SIZE = 10;

function formatCreatedAt(createdRaw) {
  if (!createdRaw) return "—";
  const d = new Date(String(createdRaw));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function DashboardMyQrs() {
  const queryClient = useQueryClient();
  const [listTab, setListTab] = useState("dynamic");
  const { data: rows = [], isLoading, isError, error, refetch } = useQrListQuery();
  const {
    data: staticData,
    isLoading: staticLoading,
    isError: staticIsError,
    error: staticError,
    refetch: refetchStatic,
  } = useStaticQrListQuery();

  const [query, setQuery] = useState("");
  const [pageDynamic, setPageDynamic] = useState(1);
  const [pageStatic, setPageStatic] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: (qrId) => deleteQr(qrId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QR_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QR_ACTIVITY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QR_ANALYTICS_SUMMARY_QUERY_KEY });
      setDeleteTarget(null);
    },
  });

  const deleteStaticMutation = useMutation({
    mutationFn: (id) => deleteStaticQr(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STATIC_QR_LIST_QUERY_KEY });
      setDeleteTarget(null);
    },
  });

  useEffect(() => {
    const prev = document.title;
    document.title = "ZynQR | My QRs";
    return () => {
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    setPageDynamic(1);
    setPageStatic(1);
  }, [query]);

  const staticRowsNormalized = useMemo(() => {
    const raw = staticData?.items ?? [];
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => ({
      id: String(item.id ?? ""),
      name: String(item.name || "Untitled"),
      encoded_payload: String(item.encoded_payload ?? ""),
      image_data_url: String(item.image_data_url ?? ""),
      created: formatCreatedAt(item.created_at ?? item.CreatedAt),
    }));
  }, [staticData]);

  const filteredDynamic = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.shortLink.toLowerCase().includes(q) ||
        row.destination.toLowerCase().includes(q),
    );
  }, [query, rows]);

  const filteredStatic = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staticRowsNormalized;
    return staticRowsNormalized.filter(
      (row) =>
        row.name.toLowerCase().includes(q) || row.encoded_payload.toLowerCase().includes(q),
    );
  }, [query, staticRowsNormalized]);

  const totalDynamic = filteredDynamic.length;
  const totalStatic = filteredStatic.length;
  const totalPagesDynamic = Math.max(1, Math.ceil(totalDynamic / PAGE_SIZE) || 1);
  const totalPagesStatic = Math.max(1, Math.ceil(totalStatic / PAGE_SIZE) || 1);

  const effectivePageDynamic = Math.min(pageDynamic, totalPagesDynamic);
  const effectivePageStatic = Math.min(pageStatic, totalPagesStatic);

  useEffect(() => {
    setPageDynamic((p) => Math.min(p, totalPagesDynamic));
  }, [totalPagesDynamic]);

  useEffect(() => {
    setPageStatic((p) => Math.min(p, totalPagesStatic));
  }, [totalPagesStatic]);

  const pagedDynamic = useMemo(() => {
    const start = (effectivePageDynamic - 1) * PAGE_SIZE;
    return filteredDynamic.slice(start, start + PAGE_SIZE);
  }, [filteredDynamic, effectivePageDynamic]);

  const pagedStatic = useMemo(() => {
    const start = (effectivePageStatic - 1) * PAGE_SIZE;
    return filteredStatic.slice(start, start + PAGE_SIZE);
  }, [filteredStatic, effectivePageStatic]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "dynamic") {
        await deleteMutation.mutateAsync(deleteTarget.row.id);
      } else {
        await deleteStaticMutation.mutateAsync(deleteTarget.row.id);
      }
    } catch (e) {
      toastApiError(e, "Delete failed");
    }
  }

  const loadErrorDynamic = isError ? String(error?.response?.data?.error ?? error?.message ?? "Failed to load QR codes") : null;
  const loadErrorStatic = staticIsError
    ? String(staticError?.response?.data?.error ?? staticError?.message ?? "Failed to load static QR codes")
    : null;

  const deletePending = deleteMutation.isPending || deleteStaticMutation.isPending;

  return (
    <div className={`${DASHBOARD_PAGE_INSET} overflow-x-hidden`}>
      <nav aria-label="Breadcrumb" className="mb-6 md:hidden">
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
            My QRs
          </li>
        </ol>
      </nav>

      <header className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <h1 className="font-headline mb-3 text-4xl font-extrabold tracking-tight text-on-surface">My QR Codes</h1>
          <div
            className="mb-5 inline-flex w-full max-w-md rounded-full border border-outline-variant/30 bg-surface-container-high p-1 sm:w-auto"
            role="tablist"
            aria-label="QR code type"
          >
            <button
              type="button"
              role="tab"
              aria-selected={listTab === "dynamic"}
              className={`min-h-10 flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors sm:flex-none sm:px-6 ${
                listTab === "dynamic"
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              onClick={() => setListTab("dynamic")}
            >
              Dynamic
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={listTab === "static"}
              className={`min-h-10 flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors sm:flex-none sm:px-6 ${
                listTab === "static"
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              onClick={() => setListTab("static")}
            >
              Static
            </button>
          </div>
          {listTab === "dynamic" ? (
            <p className="max-w-xl text-on-surface-variant">
              Short links that redirect through ZynQR. Scans are recorded (IP, browser, approximate location) — see
              Recent Activity and per-QR analytics.
            </p>
          ) : (
            <p className="max-w-xl text-on-surface-variant">
              PNGs that encode your payload directly. There is no hosted short link or scan pipeline; printed codes stay
              valid offline. Manage or remove them here only.
            </p>
          )}
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:min-w-0 lg:max-w-xl lg:flex-1 xl:max-w-2xl">
          <div className="min-w-0 w-full flex-1">
            <TextField
              id="qr-search"
              name="q"
              label="Search codes"
              labelClassName="sr-only"
              placeholder="Search codes..."
              startIcon="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {listTab === "dynamic" ? (
            <Link
              className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 font-bold text-on-primary shadow-lg shadow-primary/10 transition-all hover:bg-primary-container active:scale-95"
              to="/dashboard/create"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Create dynamic QR
            </Link>
          ) : (
            <Link
              className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 font-bold text-on-primary shadow-lg shadow-primary/10 transition-all hover:bg-primary-container active:scale-95"
              to="/dashboard/create-static-qr"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Create static QR
            </Link>
          )}
        </div>
      </header>

      {listTab === "dynamic" && loadErrorDynamic ? (
        <div className="mb-6 rounded-2xl border border-error/30 bg-error-container/10 px-4 py-3 text-sm text-on-surface">
          <span className="font-semibold">Could not load QR codes.</span> {loadErrorDynamic}{" "}
          <button className="ml-2 font-bold text-primary underline" type="button" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      ) : null}

      {listTab === "static" && loadErrorStatic ? (
        <div className="mb-6 rounded-2xl border border-error/30 bg-error-container/10 px-4 py-3 text-sm text-on-surface">
          <span className="font-semibold">Could not load static QR codes.</span> {loadErrorStatic}{" "}
          <button className="ml-2 font-bold text-primary underline" type="button" onClick={() => refetchStatic()}>
            Retry
          </button>
        </div>
      ) : null}

      {listTab === "dynamic" ? (
        <QrCodesTable
          rows={isLoading ? [] : pagedDynamic}
          totalCount={isLoading ? 0 : totalDynamic}
          page={effectivePageDynamic}
          pageSize={PAGE_SIZE}
          onPageChange={setPageDynamic}
          emptyMessage={isLoading ? "Loading…" : "No codes match your search."}
          onRequestDelete={(row) => setDeleteTarget({ type: "dynamic", row })}
        />
      ) : (
        <StaticQrCodesTable
          rows={staticLoading ? [] : pagedStatic}
          totalCount={staticLoading ? 0 : totalStatic}
          page={effectivePageStatic}
          pageSize={PAGE_SIZE}
          onPageChange={setPageStatic}
          emptyMessage={staticLoading ? "Loading…" : "No static codes match your search."}
          onRequestDelete={(row) => setDeleteTarget({ type: "static", row })}
        />
      )}

      <QrCodeDeleteConfirmModal
        open={Boolean(deleteTarget)}
        row={deleteTarget ? { id: deleteTarget.row.id, name: deleteTarget.row.name } : null}
        pending={deletePending}
        onClose={() => !deletePending && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
