import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import QrCodeDeleteConfirmModal from "../../components/dashboard/QrCodeDeleteConfirmModal";
import QrImagePreviewModal from "../../components/dashboard/QrImagePreviewModal";
import TextField from "../../components/ui/TextField";
import { deleteQr, updateQr } from "../../api/qr.api";
import {
  QR_ACTIVITY_QUERY_KEY,
  QR_ANALYTICS_SUMMARY_QUERY_KEY,
  QR_LIST_QUERY_KEY,
  useQrRowById,
} from "../../hooks/useQrList";
import { toastApiError } from "../../utils/toast";

const EDIT_LABEL_CLASS =
  "font-label block px-1 text-xs font-black tracking-widest text-on-surface-variant uppercase";

function initialDestinationUrl(destination) {
  if (!destination) return "https://";
  return destination.startsWith("http") ? destination : `https://${destination}`;
}

export default function DashboardQrEdit() {
  const { qrId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { row, isLoading, isError, error, refetch } = useQrRowById(qrId ?? "");

  const [name, setName] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("https://");
  const [active, setActive] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!row) return;
    setName(row.name);
    setDestinationUrl(initialDestinationUrl(row.destination));
    setActive(row.status === "active");
    setAnalyticsEnabled(row.analyticsEnabled !== false);
  }, [row]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateQr(qrId ?? "", {
        qr_name: name.trim(),
        destination_url: destinationUrl.trim(),
        status: active ? "active" : "inactive",
        analytics_enabled: analyticsEnabled,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QR_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QR_ACTIVITY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QR_ANALYTICS_SUMMARY_QUERY_KEY });
      navigate("/dashboard/my-qrs");
    },
    onError: (e) => {
      toastApiError(e, "Update failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteQr(qrId ?? ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QR_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QR_ACTIVITY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QR_ANALYTICS_SUMMARY_QUERY_KEY });
      setDeleteOpen(false);
      navigate("/dashboard/my-qrs");
    },
    onError: (e) => {
      toastApiError(e, "Delete failed");
    },
  });

  const loadError = useMemo(() => {
    if (!isError) return null;
    return String(error?.response?.data?.error ?? error?.message ?? "Failed to load");
  }, [isError, error]);

  useEffect(() => {
    const prev = document.title;
    document.title = "Edit QR Code | ZynQR";
    return () => {
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    if (deleteOpen) return;
    function onKeyDown(e) {
      if (e.key === "Escape") navigate("/dashboard/my-qrs");
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navigate, deleteOpen]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!qrId) return;
    updateMutation.mutate();
  }

  const notFound = Boolean(qrId) && !isLoading && !isError && !row;
  const hasPreviewImage = Boolean(row?.qrImageUrl?.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <Link
        aria-label="Close and return to My QRs"
        className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm"
        to="/dashboard/my-qrs"
      />
      <div className="glass-panel relative z-10 flex max-h-[min(92vh,880px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-outline-variant/15 bg-surface-container-lowest shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-outline-variant/15 px-6 py-5 sm:px-8 sm:py-6">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/12 px-3 py-1 text-[10px] font-black tracking-widest text-primary uppercase">
                Dynamic QR
              </span>
              {row?.status === "inactive" ? (
                <span className="rounded-full bg-surface-container-high px-3 py-1 text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
                  Inactive
                </span>
              ) : null}
            </div>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
              Edit QR Code
            </h1>
            <p className="mt-1 max-w-xl text-sm text-on-surface-variant">
              Short link redirects to your URL; optional scan tracking and status below.
            </p>
          </div>
          <Link
            aria-label="Close"
            className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container-high transition-all hover:bg-error/10 hover:text-error active:scale-95"
            to="/dashboard/my-qrs"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </Link>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loadError ? (
            <div className="px-6 py-6 sm:px-8">
              <p className="text-sm text-error">
                {loadError}{" "}
                <button className="font-bold text-primary underline" type="button" onClick={() => refetch()}>
                  Retry
                </button>
              </p>
            </div>
          ) : null}

          {isLoading ? (
            <p className="py-16 text-center text-on-surface-variant">Loading…</p>
          ) : notFound ? (
            <p className="px-6 py-8 text-on-surface-variant sm:px-8">
              No QR found with this id.{" "}
              <Link className="font-bold text-primary underline" to="/dashboard/my-qrs">
                Back to My QRs
              </Link>
            </p>
          ) : (
            <form className="grid grid-cols-1 gap-8 px-6 py-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:py-8" onSubmit={handleSubmit}>
              {/* Left: preview */}
              <div className="flex flex-col gap-4 lg:sticky lg:top-0 lg:self-start">
                <div className="rounded-2xl border border-outline-variant/15 bg-linear-to-br from-surface-container-low to-surface-container-lowest p-5 shadow-inner ring-1 ring-black/3">
                  <p className="mb-3 text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
                    QR preview
                  </p>
                  <button
                    className="group relative mx-auto flex aspect-square w-full max-w-[240px] items-center justify-center overflow-hidden rounded-2xl border border-white bg-white p-4 shadow-lg shadow-on-surface/10 transition-[transform,box-shadow] hover:shadow-xl disabled:cursor-default disabled:opacity-90"
                    disabled={!hasPreviewImage}
                    type="button"
                    aria-label={hasPreviewImage ? "Open preview and download options" : "No QR image available"}
                    onClick={() => hasPreviewImage && setPreviewOpen(true)}
                  >
                    {hasPreviewImage ? (
                      <>
                        <img alt="" className="h-full w-full object-contain" src={row.qrImageUrl} />
                        <span className="absolute inset-0 flex items-center justify-center bg-on-surface/0 opacity-0 transition-opacity group-hover:bg-on-surface/5 group-hover:opacity-100">
                          <span className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-lg">
                            Tap for downloads
                          </span>
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-5xl opacity-40">qr_code_2</span>
                        <span className="text-xs">No image stored</span>
                      </div>
                    )}
                  </button>
                  {row?.shortLink ? (
                    <p className="mt-4 break-all font-mono text-[11px] leading-relaxed text-on-surface-variant">
                      <span className="font-sans text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
                        Scan link{" "}
                      </span>
                      {row.shortLink}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Right: fields */}
              <div className="flex min-w-0 flex-col gap-6">
                <TextField
                  variant="editorial"
                  labelClassName={EDIT_LABEL_CLASS}
                  className="rounded-xl font-bold"
                  endIcon="drive_file_rename_outline"
                  id="edit-qr-name"
                  name="name"
                  label="QR Name"
                  placeholder="e.g. Campaign Alpha"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <TextField
                  variant="editorial"
                  labelClassName={EDIT_LABEL_CLASS}
                  className="rounded-xl font-bold"
                  endIcon="link"
                  id="edit-qr-url"
                  name="destinationUrl"
                  label="Destination URL"
                  placeholder="https://yourlink.com"
                  type="url"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                />

                <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low/80 shadow-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-outline-variant/15 p-4 sm:p-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                          bolt
                        </span>
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-on-surface">Active</div>
                        <div className="text-xs text-on-surface-variant">Paused codes keep the link but you can pause campaigns</div>
                      </div>
                    </div>
                    <button
                      aria-checked={active}
                      aria-label="Toggle active status"
                      className={`relative h-9 w-14 shrink-0 rounded-full shadow-inner transition-colors ${
                        active ? "bg-primary" : "bg-surface-container-high"
                      }`}
                      role="switch"
                      type="button"
                      onClick={() => setActive((v) => !v)}
                    >
                      <span
                        className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow-md transition-transform ${
                          active ? "right-1 translate-x-0" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tertiary/10">
                        <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                          auto_graph
                        </span>
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-on-surface">Analytics</div>
                        <div className="text-xs text-on-surface-variant">Off = redirect only, no scan counts or logs</div>
                      </div>
                    </div>
                    <button
                      aria-checked={analyticsEnabled}
                      aria-label="Toggle analytics"
                      className={`relative h-9 w-14 shrink-0 rounded-full shadow-inner transition-colors ${
                        analyticsEnabled ? "bg-primary" : "bg-surface-container-high"
                      }`}
                      role="switch"
                      type="button"
                      onClick={() => setAnalyticsEnabled((v) => !v)}
                    >
                      <span
                        className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow-md transition-transform ${
                          analyticsEnabled ? "right-1 translate-x-0" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                  <button
                    className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-primary px-8 py-3.5 font-headline text-sm font-extrabold text-on-primary shadow-lg shadow-primary/25 transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-60"
                    type="submit"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Saving…" : "Save changes"}
                  </button>
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-outline-variant/35 bg-transparent px-8 py-3.5 font-headline text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high sm:min-w-32"
                    to="/dashboard/my-qrs"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </form>
          )}

          {!isLoading && row ? (
            <div className="border-t border-outline-variant/15 px-6 py-5 sm:px-8">
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold tracking-wide text-error transition-colors hover:bg-error/8 sm:w-auto sm:justify-start"
                type="button"
                onClick={() => setDeleteOpen(true)}
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                Delete this QR code
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {row && hasPreviewImage ? (
        <QrImagePreviewModal
          open={previewOpen}
          fileStem={row.id}
          imageSrc={row.qrImageUrl}
          title={row.name || "QR code"}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}

      <QrCodeDeleteConfirmModal
        open={deleteOpen}
        row={row}
        pending={deleteMutation.isPending}
        onClose={() => !deleteMutation.isPending && setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
