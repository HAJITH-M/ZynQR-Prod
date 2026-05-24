import { Link } from "react-router-dom";
import { FEATURE_FLOW_IMG } from "../../lib/landing/assets";
import {
  BENTO_GRID_CARDS,
  EXTRA_FEATURE_CARDS,
  HOW_IT_WORKS_STEPS,
  USE_CASE_IDEAS,
} from "../../lib/landing/featuresExtended";

export default function LandingFeatures() {
  return (
    <>
    <section className="bg-surface-container-low px-8 py-24">
      <div className="container mx-auto">
        <div className="mb-16 space-y-4 text-center">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
            Precision at every scale.
          </h1>
          <p className="text-lg text-on-surface-variant">Stop printing and re-printing. Start evolving.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="group flex flex-col justify-between overflow-hidden rounded-4xl bg-surface-container-lowest p-10 transition-all hover:bg-white md:col-span-2">
            <div className="max-w-md">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed transition-transform group-hover:rotate-12">
                <span className="material-symbols-outlined text-3xl text-primary">bolt</span>
              </div>
              <h2 className="font-headline mb-4 text-3xl font-bold">Instant Updates</h2>
              <p className="mb-8 leading-relaxed text-on-surface-variant">
                Change your destination URL anytime without changing the QR code. Perfect for seasonal menus,
                changing campaigns, or temporary promotions.
              </p>
            </div>
            <div className="relative h-48 overflow-hidden rounded-xl">
              <img
                alt="Abstract data flow visualization with orange light trails"
                className="h-full w-full object-cover"
                src={FEATURE_FLOW_IMG}
              />
            </div>
          </div>

          <div className="group relative flex flex-col justify-between overflow-hidden rounded-4xl bg-primary p-10 text-on-primary">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-transform duration-700 group-hover:scale-150" />
            <div>
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <span className="material-symbols-outlined text-3xl text-white">analytics</span>
              </div>
              <h2 className="font-headline mb-4 text-3xl font-bold">Analytics Dashboard</h2>
              <p className="leading-relaxed text-white/80">
                Track city, country, device type, and time of scan with surgical precision.
              </p>
            </div>
            <div className="pt-12">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-3/4 bg-white" />
              </div>
              <div className="mt-2 flex justify-between text-xs font-bold">
                <span>SCANS TODAY</span>
                <span>+24%</span>
              </div>
            </div>
          </div>

          <div className="group flex flex-col items-center rounded-4xl bg-surface-container-lowest p-10 text-center">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary-fixed transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-3xl text-tertiary">download</span>
            </div>
            <h2 className="font-headline mb-4 text-2xl font-bold">Print-ready exports</h2>
            <p className="text-on-surface-variant">
              Download any QR as PNG, SVG, or EPS from the dashboard — ready for menus, packaging, and design files.
            </p>
          </div>

          <div className="group flex flex-col justify-between rounded-4xl bg-surface-container-lowest p-10 transition-all hover:bg-white">
            <div>
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-fixed transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-3xl text-secondary">{BENTO_GRID_CARDS[0].icon}</span>
              </div>
              <h2 className="font-headline mb-4 text-2xl font-bold">{BENTO_GRID_CARDS[0].title}</h2>
              <p className="text-sm leading-relaxed text-on-surface-variant">{BENTO_GRID_CARDS[0].description}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {BENTO_GRID_CARDS[0].tags.map((tag) => (
                <span
                  key={tag}
                  className={
                    tag === "Dynamic"
                      ? "rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-primary"
                      : "rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold text-on-surface-variant"
                  }
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <Link
            className="group relative flex flex-col justify-between overflow-hidden rounded-4xl bg-on-surface p-10 text-white transition-all hover:brightness-110"
            to={BENTO_GRID_CARDS[1].linkTo}
          >
            <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <span className="material-symbols-outlined text-3xl text-primary-container">
                  {BENTO_GRID_CARDS[1].icon}
                </span>
              </div>
              <h2 className="font-headline mb-4 text-2xl font-bold">{BENTO_GRID_CARDS[1].title}</h2>
              <p className="text-sm leading-relaxed text-white/75">{BENTO_GRID_CARDS[1].description}</p>
            </div>
            <p className="relative mt-8 text-sm font-bold text-primary-container">{BENTO_GRID_CARDS[1].linkLabel} →</p>
          </Link>
        </div>
      </div>
    </section>

    <section className="border-t border-outline-variant/15 bg-surface px-8 py-20 md:py-24">
      <div className="container mx-auto">
        <div className="mb-12 max-w-2xl">
          <p className="font-label mb-2 text-xs font-bold tracking-widest text-primary uppercase">More capability</p>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight md:text-4xl">
            Everything else you get with ZynQR
          </h2>
          <p className="mt-3 text-on-surface-variant">
            Beyond instant updates, analytics, and branding — the full platform is included on the free plan.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {EXTRA_FEATURE_CARDS.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed">
                <span className="material-symbols-outlined text-2xl text-primary">{item.icon}</span>
              </div>
              <h3 className="font-headline mb-2 text-lg font-bold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-surface-container-low px-8 py-20 md:py-24">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="font-label mb-2 text-xs font-bold tracking-widest text-primary uppercase">How it works</p>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight md:text-4xl">Three steps to live QRs</h2>
        </div>
        <ol className="grid gap-8 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <li key={step.step} className="relative text-center md:text-left">
              <span className="font-headline mb-3 block text-4xl font-black text-primary/25">{step.step}</span>
              <h3 className="font-headline mb-2 text-xl font-bold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className="px-8 py-20 md:py-24">
      <div className="container mx-auto">
        <div className="mb-10 text-center">
          <h2 className="font-headline text-3xl font-extrabold tracking-tight md:text-4xl">Built for real-world use</h2>
          <p className="mt-3 text-on-surface-variant">Teams use ZynQR wherever links need to stay fresh or measurable.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASE_IDEAS.map((item) => (
            <div key={item.title} className="rounded-2xl bg-surface-container-low p-5 ring-1 ring-outline-variant/10">
              <span className="material-symbols-outlined mb-3 text-3xl text-primary">{item.icon}</span>
              <h3 className="font-headline mb-1 text-base font-bold">{item.title}</h3>
              <p className="text-xs leading-relaxed text-on-surface-variant">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="px-8 pb-24">
      <div className="container mx-auto">
        <div className="rounded-4xl bg-primary-container px-8 py-12 text-center md:px-14">
          <h2 className="font-headline mb-3 text-2xl font-extrabold text-on-primary-container md:text-3xl">
            All of this — free to start
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-sm text-on-primary-container/90 md:text-base">
            No credit card. Create your account, generate QRs, and open Global Analytics in minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-white/50 hover:text-amber-950 hover:shadow-xl"
              to="/register"
            >
              Get started free
            </Link>
            <Link
              className="rounded-full border-2 border-on-primary-container/30 bg-transparent px-8 py-3.5 text-sm font-bold text-on-primary-container transition-all hover:bg-on-primary-container/10"
              to="/api"
            >
              Explore the API
            </Link>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
