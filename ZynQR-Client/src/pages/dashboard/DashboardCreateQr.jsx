import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TextField from "../../components/ui/TextField";
import { createQr } from "../../api/qr.api";
import { QR_ACTIVITY_QUERY_KEY, QR_ANALYTICS_SUMMARY_QUERY_KEY, QR_LIST_QUERY_KEY } from "../../hooks/useQrList";
import { toastApiError, toastWarning } from "../../utils/toast";

const createQrFieldLabelClass =
  "font-label block px-1 text-sm font-semibold text-on-surface-variant";

export default function DashboardCreateQr() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qrName, setQrName] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const createMutation = useMutation({
    mutationFn: () => {
      const email = localStorage.getItem("email");
      if (!email) throw new Error("Missing session email. Please log in again.");
      return createQr({
        email,
        qr_name: qrName.trim(),
        destination_url: destinationUrl.trim(),
        analytics_enabled: analyticsEnabled,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QR_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QR_ACTIVITY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QR_ANALYTICS_SUMMARY_QUERY_KEY });
      navigate("/dashboard/my-qrs?tab=dynamic");
    },
    onError: (e) => {
      toastApiError(e, "Could not create QR code");
    },
  });

  useEffect(() => {
    const prev = document.title;
    document.title = "Create QR - ZynQR";
    return () => {
      document.title = prev;
    };
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!qrName.trim()) {
      toastWarning("Please enter a QR name.");
      return;
    }
    if (!destinationUrl.trim()) {
      toastWarning("Please enter a destination URL.");
      return;
    }
    createMutation.mutate();
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden px-4 py-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-5%] h-100 w-100 rounded-full bg-primary-container/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] h-75 w-75 rounded-full bg-tertiary-container/5 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl">
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
              Create QR
            </li>
          </ol>
        </nav>

        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-center space-y-6 px-4 lg:col-span-5">
            <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">
              Create <span className="text-primary">dynamic</span> QR codes
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-on-surface-variant">
              Each code gets a public scan link (<span className="font-mono text-sm">/qr/&lt;id&gt;</span>) that
              redirects to your destination URL. Scans are counted on the server when someone opens that link.
            </p>
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-primary">
                  <span className="material-symbols-outlined">auto_graph</span>
                </div>
                <span className="font-medium text-on-surface">Scan count tracked per code</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-fixed text-tertiary">
                  <span className="material-symbols-outlined">edit</span>
                </div>
                <span className="font-medium text-on-surface">Edit name, URL, or status later</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="glass-panel rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-sm lg:p-10">
              <p className="mb-6 rounded-xl border border-primary-container/20 bg-primary-container/5 px-4 py-3 text-sm text-on-surface-variant">
                Provide a name and destination URL. Use <strong className="text-on-surface">Enable analytics</strong>{" "}
                to record scans, IP/browser/location (approx.), and dashboard charts.
              </p>
              <form className="space-y-8" onSubmit={handleSubmit}>
                <TextField
                  variant="editorial"
                  labelClassName={createQrFieldLabelClass}
                  className="font-medium"
                  id="qr-name"
                  name="qrName"
                  label="QR Name"
                  placeholder="Summer Campaign 2026"
                  type="text"
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                />

                <TextField
                  variant="editorial"
                  labelClassName={createQrFieldLabelClass}
                  className="text-lg font-medium"
                  id="url"
                  name="url"
                  label="Destination URL"
                  placeholder="https://your-brand.com/launch"
                  type="url"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                />

                <div className="flex items-center justify-between gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest/50 p-6">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container/10">
                      <span
                        className="material-symbols-outlined text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        auto_graph
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-on-surface">Enable analytics</div>
                      <div className="text-xs text-on-surface-variant">
                        When off, the short link still redirects but scans are not counted or logged.
                      </div>
                    </div>
                  </div>
                  <button
                    aria-checked={analyticsEnabled}
                    aria-label="Toggle analytics"
                    className={`relative h-8 w-14 shrink-0 rounded-full shadow-inner shadow-primary/20 transition-colors ${
                      analyticsEnabled ? "bg-primary-container" : "bg-surface-container-high"
                    }`}
                    role="switch"
                    type="button"
                    onClick={() => setAnalyticsEnabled((v) => !v)}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                        analyticsEnabled ? "right-1 translate-x-0" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-col items-center gap-4 pt-4 md:flex-row">
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-10 py-4 text-lg font-bold text-on-primary shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary-container active:scale-95 disabled:opacity-60 md:w-auto"
                    type="submit"
                    disabled={createMutation.isPending}
                  >
                    <span className="material-symbols-outlined">qr_code_2</span>
                    {createMutation.isPending ? "Creating…" : "Generate QR"}
                  </button>
                  <Link
                    className="flex w-full items-center justify-center rounded-full bg-surface-container-high px-8 py-4 font-semibold text-on-surface transition-all hover:bg-surface-container-highest md:w-auto"
                    to="/dashboard/my-qrs"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>

            <div className="mt-8 flex flex-col gap-4 px-2 text-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined scale-75 text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
                <span>Changes are saved securely to your account</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
