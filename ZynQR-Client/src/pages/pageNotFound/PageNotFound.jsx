import { Link } from "react-router-dom";
import SiteNavBar from "../../components/layout/SiteNavBar";

function PageNotFound() {
  return (
    <div className="light flex min-h-screen flex-col bg-background font-body text-on-surface">
      <SiteNavBar fixed />

      <main className="relative flex grow flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20">
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/4 right-1/4 h-32 w-32 rounded-full bg-secondary-container/20 blur-3xl" />
        <div className="z-10 flex w-full max-w-4xl flex-col items-center text-center">
          <div className="relative mb-12">
            <div className="pointer-events-none select-none text-[12rem] leading-none font-black tracking-tighter text-surface-container-highest/40 md:text-[18rem]">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-surface-container-lowest/80 p-6 shadow-[0_32px_64px_-12px_rgba(22,28,31,0.06)] backdrop-blur-xl md:h-64 md:w-64">
                <div className="flex h-full w-full flex-col items-center justify-center space-y-4 rounded-lg border-4 border-dashed border-outline-variant/30">
                  <span
                    className="material-symbols-outlined text-6xl text-primary"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >
                    qr_code_scanner
                  </span>
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-ZynQR rounded-full bg-primary" />
                    <div className="h-2 w-2 animate-ZynQR rounded-full bg-primary delay-75" />
                    <div className="h-2 w-2 animate-ZynQR rounded-full bg-primary delay-150" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-2xl space-y-6">
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-on-surface md:text-6xl">
              Whoops! This page <span className="text-primary">has vanished.</span>
            </h1>
            <p className="text-lg leading-relaxed font-medium text-on-surface-variant md:text-xl">
              The link you followed might be broken or the page has been moved. Let&apos;s get you
              back to scanning at kinetic speed.
            </p>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              className="flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-on-primary shadow-[0_20px_40px_-10px_rgba(175,49,0,0.3)] transition-all hover:bg-primary-container active:scale-95"
              to="/"
            >
              <span className="material-symbols-outlined">home</span>
              Back to Home
            </Link>
            <Link
              className="flex items-center gap-2 rounded-full bg-surface-container-high px-8 py-4 text-lg font-bold text-on-surface transition-all hover:bg-surface-container-highest active:scale-95"
              to="/contact"
            >
              <span className="material-symbols-outlined">support_agent</span>
              Contact Support
            </Link>
          </div>

          <div className="mt-24 grid w-full grid-cols-1 gap-8 text-left md:grid-cols-3">
            <div className="rounded-xl bg-surface-container-lowest p-8 shadow-sm transition-transform hover:-translate-y-1">
              <span className="material-symbols-outlined mb-4 text-primary">analytics</span>
              <h3 className="mb-2 text-xl font-bold">Check Analytics</h3>
              <p className="text-sm text-on-surface-variant">
                View performance metrics for your existing active ZynQRs.
              </p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-8 shadow-sm transition-transform hover:-translate-y-1">
              <span className="material-symbols-outlined mb-4 text-primary">history</span>
              <h3 className="mb-2 text-xl font-bold">ZynQR History</h3>
              <p className="text-sm text-on-surface-variant">
                Review recently created QR codes and their landing destinations.
              </p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-8 shadow-sm transition-transform hover:-translate-y-1">
              <span className="material-symbols-outlined mb-4 text-primary">help_outline</span>
              <h3 className="mb-2 text-xl font-bold">Help Center</h3>
              <p className="text-sm text-on-surface-variant">
                Find answers to common questions about managing your QR campaigns.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-low py-12 dark:bg-[#0b0f11]">
        <div className="mx-auto mt-auto flex w-full max-w-screen-2xl flex-col items-center justify-between space-y-8 px-12 md:flex-row md:space-y-0">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="font-['Manrope'] text-lg font-bold text-on-surface">ZynQR</div>
            <p className="font-['Inter'] text-sm text-on-surface-variant">
              © 2026 ZynQR Kinetic Precision. All rights reserved.
            </p>
          </div>
          <div className="flex gap-8">
            <a
              className="font-['Inter'] text-sm text-slate-500 decoration-primary-container decoration-2 underline-offset-4 transition-all ease-in-out hover:text-primary hover:underline"
              href="#"
            >
              Support
            </a>
            <a
              className="font-['Inter'] text-sm text-slate-500 decoration-primary-container decoration-2 underline-offset-4 transition-all ease-in-out hover:text-primary hover:underline"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="font-['Inter'] text-sm text-slate-500 decoration-primary-container decoration-2 underline-offset-4 transition-all ease-in-out hover:text-primary hover:underline"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="font-['Inter'] text-sm text-slate-500 decoration-primary-container decoration-2 underline-offset-4 transition-all ease-in-out hover:text-primary hover:underline"
              href="#"
            >
              API Docs
            </a>
          </div>
          <div className="flex gap-4">
            <span className="material-symbols-outlined cursor-pointer text-on-surface-variant hover:text-primary">
              language
            </span>
            <span className="material-symbols-outlined cursor-pointer text-on-surface-variant hover:text-primary">
              share
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PageNotFound;
