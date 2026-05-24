import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DASHBOARD_PAGE_SHELL } from "../../layouts/dashboardPageClasses";
import { USER_GUIDE_INTRO, USER_GUIDE_SECTIONS } from "../../lib/dashboard/userGuideContent";

const SCROLL_SPY_OFFSET_PX = 140;

function GuideListItem({ item }) {
  return (
    <li className="flex gap-2 text-sm leading-relaxed text-on-surface-variant">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
      <span className="min-w-0 wrap-break-word">
        {item.text}
        {item.link ? (
          <>
            {" "}
            <Link className="font-semibold text-primary hover:underline" to={item.link.to}>
              {item.link.label}
            </Link>
          </>
        ) : null}
      </span>
    </li>
  );
}

function GuideSection({ section }) {
  return (
    <section
      id={section.id}
      className="scroll-mt-28 rounded-4xl border border-outline-variant/15 bg-surface-container-lowest p-6 sm:p-8 lg:scroll-mt-24"
    >
      <div className="mb-4 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <span className="material-symbols-outlined text-2xl text-primary">{section.icon}</span>
        </span>
        <div className="min-w-0">
          <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
            {section.title}
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">{section.summary}</p>
        </div>
      </div>

      {section.paragraphs?.map((p) => (
        <p key={p.slice(0, 40)} className="mb-4 text-sm leading-relaxed text-on-surface-variant">
          {p}
        </p>
      ))}

      {section.bullets?.length ? (
        <ul className="mb-4 space-y-3">
          {section.bullets.map((item, i) => (
            <GuideListItem key={`${section.id}-${i}`} item={item} />
          ))}
        </ul>
      ) : null}

      {section.tips?.map((tip) => (
        <div
          key={tip.title}
          className="mb-4 rounded-2xl border border-primary/15 bg-primary-fixed/30 px-4 py-3"
        >
          <p className="text-xs font-bold tracking-widest text-primary uppercase">{tip.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-on-surface">{tip.body}</p>
        </div>
      ))}

      {section.relatedLinks?.length ? (
        <div className="flex flex-wrap gap-2 border-t border-outline-variant/15 pt-4">
          <span className="w-full text-xs font-bold tracking-widest text-on-surface-variant uppercase">
            Go to
          </span>
          {section.relatedLinks.map((l) => (
            <Link
              key={l.to}
              className="inline-flex items-center gap-1 rounded-full border border-outline-variant/30 bg-surface-container-low px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
              to={l.to}
            >
              {l.label}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function GuideTocLink({ section, index, activeId, onNavigate }) {
  return (
    <li>
      <a
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
          activeId === section.id
            ? "bg-surface-bright font-bold text-primary"
            : "font-medium text-on-surface/70 hover:bg-surface-bright hover:text-primary"
        }`}
        href={`#${section.id}`}
        onClick={onNavigate}
      >
        <span className="w-5 shrink-0 text-xs tabular-nums text-on-surface-variant">
          {String(index + 1).padStart(2, "0")}
        </span>
        {section.title}
      </a>
    </li>
  );
}

export default function DashboardUserGuide() {
  const [activeId, setActiveId] = useState(USER_GUIDE_SECTIONS[0]?.id ?? "");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const activeSection = useMemo(
    () => USER_GUIDE_SECTIONS.find((s) => s.id === activeId) ?? USER_GUIDE_SECTIONS[0],
    [activeId],
  );

  useEffect(() => {
    const prev = document.title;
    document.title = "User Guide | ZynQR";
    return () => {
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    function updateActiveFromScroll() {
      let current = USER_GUIDE_SECTIONS[0]?.id ?? "";
      for (const section of USER_GUIDE_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= SCROLL_SPY_OFFSET_PX) {
          current = section.id;
        }
      }
      setActiveId(current);
    }

    updateActiveFromScroll();
    window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveFromScroll);
  }, []);

  useEffect(() => {
    if (!mobileTocOpen) return;
    function onKeyDown(e) {
      if (e.key === "Escape") setMobileTocOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileTocOpen]);

  function handleTocNavigate() {
    setMobileTocOpen(false);
  }

  return (
    <div className={`${DASHBOARD_PAGE_SHELL} min-w-0`}>
      <header className="max-w-3xl mt-20 lg:mt-0">
        <p className="font-label mb-2 text-xs font-bold tracking-widest text-primary uppercase">
          Documentation
        </p>
        <h1 className="font-headline mb-3 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          {USER_GUIDE_INTRO.title}
        </h1>
        <p className="text-base leading-relaxed text-on-surface-variant">{USER_GUIDE_INTRO.subtitle}</p>
        <p className="mt-2 text-xs text-on-surface-variant/80">Last updated {USER_GUIDE_INTRO.updated}</p>
      </header>

      {/* Mobile / tablet: fixed under dashboard header */}
      <div className="fixed top-16 right-0 left-0 z-30 border-b border-outline-variant/15 bg-surface-bright/95 shadow-sm backdrop-blur-md lg:hidden">
        <div className="mx-auto w-full max-w-7xl px-4 py-2 md:px-8">
        <button
          aria-expanded={mobileTocOpen}
          className="flex w-full min-h-11 items-center gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-left transition-colors hover:border-primary/30"
          type="button"
          onClick={() => setMobileTocOpen((o) => !o)}
        >
          <span className="material-symbols-outlined shrink-0 text-xl text-primary">list</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
              Jump to section
            </span>
            <span className="block truncate text-sm font-bold text-on-surface">{activeSection?.title}</span>
          </span>
          <span
            className={`material-symbols-outlined shrink-0 text-on-surface-variant transition-transform ${
              mobileTocOpen ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>

        {mobileTocOpen ? (
          <div className="mt-2 max-h-[min(50vh,20rem)] overflow-y-auto rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-2 shadow-lg">
            <ol className="space-y-0.5">
              {USER_GUIDE_SECTIONS.map((s, i) => (
                <GuideTocLink
                  key={s.id}
                  activeId={activeId}
                  index={i}
                  section={s}
                  onNavigate={handleTocNavigate}
                />
              ))}
            </ol>
          </div>
        ) : null}
        </div>
      </div>

      {/* <div aria-hidden className="h-17 shrink-0 lg:hidden" /> */}

      <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <nav
          aria-label="Guide sections"
          className="hidden lg:sticky lg:top-24 lg:col-span-4 lg:block lg:self-start"
        >
          <div className="rounded-4xl border border-outline-variant/15 bg-surface-container-low p-4 sm:p-5">
            <h2 className="font-headline mb-3 px-2 text-sm font-bold text-on-surface">On this page</h2>
            <ol className="space-y-0.5">
              {USER_GUIDE_SECTIONS.map((s, i) => (
                <GuideTocLink key={s.id} activeId={activeId} index={i} section={s} />
              ))}
            </ol>
          </div>
        </nav>

        <div className="min-w-0 space-y-6 lg:col-span-8">
          {USER_GUIDE_SECTIONS.map((section) => (
            <GuideSection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
