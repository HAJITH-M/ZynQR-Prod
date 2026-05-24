import { Link } from "react-router-dom";
import { CTA_BG_IMG, HERO_IMG } from "../../lib/landing/assets";

export default function LandingHome() {
  return (
    <>
      <section className="relative flex min-h-[640px] items-center overflow-hidden bg-surface py-16 sm:py-20 lg:min-h-screen lg:py-0">
        <div className="relative z-10 container mx-auto grid items-center gap-12 px-4 sm:px-6 md:px-8 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="font-label inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-2 text-xs font-bold tracking-widest text-on-primary-fixed-variant uppercase shadow-sm">
              <span className="h-2 w-2 animate-ZynQR rounded-full bg-primary" />
              Next Generation QR SaaS
            </div>
            <h1 className="font-headline text-6xl leading-[1.1] font-extrabold tracking-tighter text-on-surface md:text-7xl">
              Static QR Codes are <span className="text-primary italic">Boring.</span> Make yours{" "}
              <span className="decoration-primary-container underline decoration-8 underline-offset-8">
                Dynamic.
              </span>
            </h1>
            <p className="max-w-lg text-xl leading-relaxed text-on-surface-variant">
              Transform every interaction. Update destination URLs instantly, track granular analytics, and
              export print-ready codes and track every scan with precision.
            </p>
            <div className="flex flex-col items-stretch gap-3 pt-4 text-center sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                className="rounded-full bg-primary px-6 py-3 text-base font-bold text-on-primary shadow-xl shadow-primary/20 transition-all hover:bg-primary-container sm:px-8 sm:py-4 sm:text-lg"
                to="/register"
              >
                Start for Free
              </Link>
              <Link
                className="rounded-full bg-surface-container-high px-6 py-3 text-base font-bold text-on-surface transition-all hover:bg-surface-container-highest sm:px-8 sm:py-4 sm:text-lg"
                to="/features"
              >
                Explore Features
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-primary-container/20 blur-[100px]" />
            <div className="glass-card relative overflow-hidden rounded-4xl border border-outline-variant/30 p-8 shadow-2xl">
              <img
                alt="Futuristic QR code with orange ZynQR lines on a floating card"
                className="w-full rounded-xl"
                src={HERO_IMG}
              />
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-surface-container-low p-4">
                  <span className="font-label mb-1 block text-xs font-bold text-on-surface-variant">
                    REAL-TIME SCANS
                  </span>
                  <span className="font-headline text-2xl font-black text-primary">12,482</span>
                </div>
                <div className="rounded-xl bg-surface-container-low p-4">
                  <span className="font-label mb-1 block text-xs font-bold text-on-surface-variant">
                    CONVERSION
                  </span>
                  <span className="font-headline text-2xl font-black text-tertiary">14.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:px-8 md:py-24">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-on-surface p-6 text-center text-white sm:rounded-[2.5rem] sm:p-10 md:rounded-[3rem] md:p-16">
            <div className="absolute top-0 left-0 h-full w-full opacity-10">
              <img alt="" className="h-full w-full object-cover" src={CTA_BG_IMG} />
            </div>
            <div className="relative z-10">
              <h2 className="font-headline mb-6 text-3xl font-black leading-tight sm:mb-8 sm:text-4xl md:text-5xl">
                Ready to put your brand{" "}
                <br className="hidden sm:inline" />
                on the ZynQR?
              </h2>
              <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                <Link
                  className="rounded-full bg-primary-container px-6 py-3 text-base font-black text-on-primary-container transition-transform hover:scale-105 sm:px-10 sm:py-5 sm:text-xl"
                  to="/register"
                >
                  Get Started Free
                </Link>
                <Link
                  className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-base font-black text-white backdrop-blur-xl transition-all hover:bg-white/20 sm:px-10 sm:py-5 sm:text-xl"
                  to="/pricing"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
