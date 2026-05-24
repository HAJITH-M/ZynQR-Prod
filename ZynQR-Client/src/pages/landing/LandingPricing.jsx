import { useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { getToken, subscribeAuthToken } from "../../api/axiosInstance";
import { LANDING_DEVELOPER_PLAN, LANDING_FREE_PLAN } from "../../lib/landing/pricingPlans";

/**
 * @param {{ plan: import("../../lib/landing/pricingPlans").PricingPlan; children?: import("react").ReactNode }} props
 */
function PricingPlanCard({ plan, children }) {
  const highlighted = plan.highlighted;

  return (
    <div
      className={
        highlighted
          ? "relative flex h-full flex-col rounded-3xl border-2 border-primary bg-surface-container-lowest p-6 shadow-lg shadow-primary/10 md:p-7"
          : "relative flex h-full flex-col rounded-3xl border border-outline-variant/25 bg-surface-container p-6 md:p-7"
      }
    >
      {plan.badge ? (
        <div
          className={`absolute top-0 right-6 -translate-y-1/2 rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase ${
            highlighted ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          {plan.badge}
        </div>
      ) : null}

      <div className="mb-5 border-b border-outline-variant/20 pb-5">
        <span
          className={`text-xs font-bold tracking-widest uppercase ${
            highlighted ? "text-primary" : "text-on-surface-variant"
          }`}
        >
          {plan.tierLabel}
        </span>
        <h2 className="font-headline mt-1 text-2xl font-black md:text-3xl">{plan.priceDisplay}</h2>
        {plan.tagline ? (
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{plan.tagline}</p>
        ) : null}
      </div>

      <ul className="mb-6 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-center gap-2.5 text-sm text-on-surface">
            <span
              className={`material-symbols-outlined shrink-0 text-lg ${highlighted ? "text-primary" : "text-on-surface-variant"}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span className="font-medium">{f.label}</span>
          </li>
        ))}
      </ul>

      {plan.cta.variant === "primary" ? (
        <Link
          className="w-full rounded-full bg-primary py-3 text-center text-base font-bold text-on-primary shadow-md shadow-primary/20 transition-all hover:bg-primary-container"
          to={plan.cta.to ?? "/register"}
        >
          {plan.cta.label}
        </Link>
      ) : (
        <Link
          className="w-full rounded-full border-2 border-outline-variant py-3 text-center text-base font-bold text-on-surface transition-all hover:bg-surface-container-high"
          to={plan.cta.to ?? "/api"}
        >
          {plan.cta.label}
        </Link>
      )}

      {plan.secondaryCta ? (
        <Link
          className="mt-3 block text-center text-sm font-semibold text-primary hover:underline"
          to={plan.secondaryCta.to ?? "/dashboard/api-docs"}
        >
          {plan.secondaryCta.label}
        </Link>
      ) : null}

      {children}
    </div>
  );
}

export default function LandingPricing() {
  const isAuthed = Boolean(useSyncExternalStore(subscribeAuthToken, getToken, () => null));

  return (
    <section className="bg-surface px-6 py-16 md:py-20">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center md:mb-10">
          <h1 className="font-headline mb-4 text-3xl font-black tracking-tight md:text-4xl">
            Everything you need, <span className="text-primary">free.</span>
          </h1>
          <p className="text-base text-on-surface-variant">
            Use the dashboard or build with our API — no paid tiers, open source friendly.
          </p>
        </div>

        <div className="grid items-stretch gap-6 md:grid-cols-2">
          <PricingPlanCard plan={LANDING_FREE_PLAN}>
            {!isAuthed ? (
              <p className="mt-4 text-center text-xs text-on-surface-variant">
                Already have an account?{" "}
                <Link className="font-semibold text-primary hover:underline" to="/login">
                  Sign in
                </Link>
              </p>
            ) : null}
          </PricingPlanCard>

          <PricingPlanCard plan={LANDING_DEVELOPER_PLAN} />
        </div>
      </div>
    </section>
  );
}
