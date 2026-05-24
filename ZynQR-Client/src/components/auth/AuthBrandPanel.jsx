import { Link } from "react-router-dom";
import zynQrLogo from "../../assets/ZynQR-Logo.png";
/**
 * Left column for login / register: full-height brand panel with logo asset.
 *
 * @param {{ tagline?: string; supporting?: string }} props
 */
export default function AuthBrandPanel({ tagline, supporting }) {
  return (
    <aside className="relative hidden h-full w-1/2 shrink-0 grow-0 flex-col items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-primary to-slate-900 px-10 py-16 lg:flex">
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-secondary-container/50 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-tertiary/40 blur-3xl" />
      </div>
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center xl:max-w-xl">
        <div aria-label="ZynQR — go to home" className="block transition-opacity hover:opacity-90">
          <img
            alt="ZynQR"
            className="h-auto w-full max-w-[min(420px,38vw)] object-contain drop-shadow-2xl xl:max-w-[min(440px,36vw)]"
            decoding="async"
            height={360}
            src={zynQrLogo}
            width={720}
          />
        </div>
        {tagline ? (
          <p className="mt-6 max-w-md px-2 text-sm font-semibold leading-relaxed text-white/90 sm:mt-8 sm:text-base md:text-base">
            {tagline}
          </p>
        ) : null}
        {supporting ? (
          <p className="mt-2 max-w-md px-2 text-xs leading-relaxed text-white/65 sm:text-sm md:text-sm">{supporting}</p>
        ) : null}
        <Link
          aria-label="Back to home"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/20"
          to="/"
        >
          <span aria-hidden className="material-symbols-outlined text-base">arrow_back</span>
          Back to home
        </Link>
      </div>
    </aside>
  );
}
