import { Link } from "react-router-dom";
import { FEATURE_API_IMG } from "../../lib/landing/assets";
import {
  API_OVERVIEW_CAPABILITIES,
  API_OVERVIEW_INTRO,
  API_OVERVIEW_STACK,
} from "../../lib/landing/apiOverview";

export default function LandingApi() {
  return (
    <section className="bg-surface-container-low px-6 py-16 md:px-8 md:py-24">
      <div className="container mx-auto max-w-5xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">API & integrations</h1>
          <p className="mt-4 text-lg text-on-surface-variant">
            Create dynamic and static QRs, track scans, and wire ZynQR into your product — free to use, with full
            documentation when you need the details.
          </p>
        </div>

        <div className="mb-12 flex flex-col overflow-hidden rounded-3xl bg-surface-container-lowest p-6 shadow-sm md:flex-row md:gap-10 md:p-8">
          <div className="mb-6 hidden shrink-0 md:mb-0 md:block md:w-2/5">
            <img alt="API integration" className="rounded-xl shadow-md" src={FEATURE_API_IMG} />
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <h2 className="font-headline mb-3 text-2xl font-bold">{API_OVERVIEW_INTRO.title}</h2>
            <p className="mb-4 text-sm leading-relaxed text-on-surface-variant md:text-base">
              {API_OVERVIEW_INTRO.description}
            </p>
            <ul className="mb-6 flex flex-wrap gap-2 text-xs text-on-surface-variant">
              {API_OVERVIEW_STACK.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-surface-container-high px-3 py-1 font-medium"
                >
                  {item}
                </li>
              ))}
            </ul>
            <Link
              className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary transition-all hover:bg-primary-container"
              to="/dashboard/api-docs"
            >
              Full API reference
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="font-headline mb-6 text-center text-2xl font-bold md:text-3xl">What you can do</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {API_OVERVIEW_CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed">
                  <span className="material-symbols-outlined text-2xl text-primary">{cap.icon}</span>
                </div>
                <h3 className="font-headline mb-2 text-lg font-bold">{cap.title}</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-primary px-6 py-8 text-center text-on-primary md:px-10">
          <h2 className="font-headline mb-2 text-2xl font-bold">Ready to integrate?</h2>
          <p className="mx-auto mb-6 max-w-lg text-sm text-white/85">
            Sign up for a free account and use the dashboard API docs for request formats, examples, and exports
            when you are ready to build.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-primary transition-all hover:bg-white/90"
              to="/register"
            >
              Get started free
            </Link>
            <Link
              className="rounded-full border-2 border-white/60 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10"
              to="/pricing"
            >
              See pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
