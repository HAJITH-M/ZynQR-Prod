import { Link } from "react-router-dom";
import SiteNavBar from "../../components/layout/SiteNavBar";

export default function QrNotFound() {
  return (
    <div className="light flex min-h-screen flex-col bg-background font-body text-on-surface">
      <SiteNavBar fixed />

      <main className="relative flex grow flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20">
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />

        <div className="z-10 flex w-full max-w-xl flex-col items-center text-center">
          <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-2xl bg-surface-container-lowest shadow-[0_24px_48px_-12px_rgba(22,28,31,0.08)]">
            <span
              className="material-symbols-outlined text-6xl text-on-surface-variant"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              delete_forever
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface md:text-5xl">
            This QR link <span className="text-primary">no longer exists</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed font-medium text-on-surface-variant md:text-lg">
            The owner has deleted this QR code. The short link you used will not redirect anywhere
            anymore.
          </p>

          <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-on-primary shadow-[0_16px_32px_-8px_rgba(175,49,0,0.35)] transition-all hover:bg-primary-container active:scale-[0.98]"
              to="/"
            >
              <span className="material-symbols-outlined text-xl">home</span>
              Go to ZynQR home
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-container-high px-8 py-3.5 text-base font-bold text-on-surface transition-all hover:bg-surface-container-highest active:scale-[0.98]"
              to="/login"
            >
              <span className="material-symbols-outlined text-xl">dashboard</span>
              Sign in
            </Link>
          </div>

          <p className="mt-12 text-sm text-on-surface-variant/80">
            Saved this link earlier? Ask the owner for an updated QR or a new short link.
          </p>
        </div>
      </main>
    </div>
  );
}
