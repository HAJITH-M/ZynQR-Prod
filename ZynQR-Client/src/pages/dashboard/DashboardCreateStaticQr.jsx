import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TextField from "../../components/ui/TextField";
import { createStaticQr } from "../../api/staticQr.api";
import { STATIC_QR_LIST_QUERY_KEY } from "../../hooks/useQrList";
import { toastApiError, toastWarning } from "../../utils/toast";

const labelClass = "font-label block px-1 text-sm font-semibold text-on-surface-variant";

export default function DashboardCreateStaticQr() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [encodedPayload, setEncodedPayload] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createStaticQr({
        name: name.trim(),
        encoded_payload: encodedPayload.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STATIC_QR_LIST_QUERY_KEY });
      navigate("/dashboard/my-qrs?tab=static");
    },
    onError: (e) => {
      toastApiError(e, "Could not create static QR");
    },
  });

  useEffect(() => {
    const prev = document.title;
    document.title = "Create static QR — ZynQR";
    return () => {
      document.title = prev;
    };
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      toastWarning("Please enter a QR name.");
      return;
    }
    if (!encodedPayload.trim()) {
      toastWarning("QR URL is required.");
      return;
    }
    mutation.mutate();
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-4 py-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-5%] h-100 w-100 rounded-full bg-primary-container/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl shrink-0">
        <nav aria-label="Breadcrumb" className="mb-6 md:hidden">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <li>
              <Link className="font-medium text-on-surface-variant hover:text-primary" to="/dashboard">
                Dashboard
              </Link>
            </li>
            <li className="select-none text-on-surface-variant/70" aria-hidden="true">
              /
            </li>
            <li className="font-semibold text-on-surface" aria-current="page">
              Create static QR
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="space-y-6 px-4 lg:col-span-5">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface sm:text-5xl">
              Static QR (direct encode)
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-on-surface-variant">
              The image encodes your URL or text directly. There is no hosted redirect link and no scan counting —
              use dynamic QR from the dashboard if you need analytics.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-sm lg:p-10">
              <form className="space-y-8" onSubmit={handleSubmit}>
                <TextField
                  variant="editorial"
                  labelClassName={labelClass}
                  id="static-name"
                  label="Label"
                  placeholder="Campaign label"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  variant="editorial"
                  labelClassName={labelClass}
                  id="static-payload"
                  label="URL or text to encode"
                  placeholder="https://example.com or plain text"
                  type="text"
                  value={encodedPayload}
                  onChange={(e) => setEncodedPayload(e.target.value)}
                />
                <p className="text-xs text-on-surface-variant">
                  The image encodes your URL or text directly — no hosted short link or scan analytics.
                </p>
                <div className="flex flex-col gap-4 pt-2 md:flex-row">
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-10 py-4 text-lg font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-container active:scale-95 disabled:opacity-60 md:w-auto"
                    type="submit"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Creating…" : "Create static QR"}
                  </button>
                  <Link
                    className="flex w-full items-center justify-center rounded-full bg-surface-container-high px-8 py-4 font-semibold text-on-surface hover:bg-surface-container-highest md:w-auto"
                    to="/dashboard"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
