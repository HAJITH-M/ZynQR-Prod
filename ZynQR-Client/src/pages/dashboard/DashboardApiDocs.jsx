import { useEffect, useMemo, useState } from "react";
import { DASHBOARD_PAGE_SHELL } from "../../layouts/dashboardPageClasses";
import {
  API_CODEBASE_REPOS,
  API_DOC_SECTIONS,
  API_DOCS_INTRO,
  API_ENV_VARS,
  API_FRONTEND_CLIENTS,
  API_GITHUB_REPO_ROOT,
} from "../../lib/dashboard/apiDocsContent";
import {
  downloadApiReferenceJson,
  downloadApiReferenceMarkdown,
} from "../../lib/dashboard/apiDocsExport";

const SCROLL_SPY_OFFSET_PX = 140;

const METHOD_CLASS = {
  GET: "bg-blue-100 text-blue-800",
  POST: "bg-emerald-100 text-emerald-800",
  PUT: "bg-amber-100 text-amber-800",
  PATCH: "bg-violet-100 text-violet-800",
  DELETE: "bg-red-100 text-red-800",
};

function ApiEndpointCard({ endpoint }) {
  const fullPath =
    endpoint.path.startsWith("/qr") ? endpoint.path : `${API_DOCS_INTRO.basePath}${endpoint.path}`;

  return (
    <article className="rounded-2xl border border-outline-variant/15 bg-surface-container-low/50 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold ${METHOD_CLASS[endpoint.method] ?? "bg-surface-container-high"}`}
        >
          {endpoint.method}
        </span>
        <code className="min-w-0 flex-1 break-all text-sm font-semibold text-on-surface">{fullPath}</code>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            endpoint.auth ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          {endpoint.auth ? "Bearer" : "Public"}
        </span>
      </div>
      <p className="mb-2 text-sm font-medium text-on-surface">{endpoint.summary}</p>
      <p className="mb-3 text-sm text-on-surface-variant">
        <span className="font-semibold text-on-surface">Why: </span>
        {endpoint.why}
      </p>
      <dl className="space-y-1.5 text-xs text-on-surface-variant">
        {endpoint.body ? (
          <div>
            <dt className="font-bold text-on-surface">Body</dt>
            <dd className="font-mono break-all">{endpoint.body}</dd>
          </div>
        ) : null}
        {endpoint.query ? (
          <div>
            <dt className="font-bold text-on-surface">Query</dt>
            <dd className="font-mono break-all">{endpoint.query}</dd>
          </div>
        ) : null}
        {endpoint.response ? (
          <div>
            <dt className="font-bold text-on-surface">Response</dt>
            <dd>{endpoint.response}</dd>
          </div>
        ) : null}
        {endpoint.frontend ? (
          <div>
            <dt className="font-bold text-on-surface">Frontend</dt>
            <dd className="font-mono break-all">{endpoint.frontend}</dd>
          </div>
        ) : null}
        {endpoint.rateLimit ? (
          <div>
            <dt className="font-bold text-on-surface">Rate limit</dt>
            <dd>{endpoint.rateLimit}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

function ApiDocSection({ section }) {
  const isCodebase = section.id === "codebase";

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
        <p key={p.slice(0, 48)} className="mb-4 text-sm leading-relaxed text-on-surface-variant">
          {p}
        </p>
      ))}

      {section.bullets?.length ? (
        <ul className="mb-4 list-disc space-y-2 pl-5">
          {section.bullets.map((b) => (
            <li key={b.slice(0, 48)} className="text-sm leading-relaxed text-on-surface-variant">
              {b}
            </li>
          ))}
        </ul>
      ) : null}

      {section.codeExamples?.length
        ? section.codeExamples.map((block) => (
            <div key={block.title} className="mb-4">
              <p className="mb-2 text-xs font-bold tracking-wide text-on-surface-variant uppercase">{block.title}</p>
              <pre className="overflow-x-auto rounded-2xl bg-on-surface p-4 text-xs leading-relaxed text-white">
                <code>{block.code}</code>
              </pre>
            </div>
          ))
        : null}

      {section.code && !section.codeExamples?.length ? (
        <pre className="mb-4 overflow-x-auto rounded-2xl bg-on-surface p-4 text-xs leading-relaxed text-white">
          <code>{section.code}</code>
        </pre>
      ) : null}

      {section.id === "configuration" ? (
        <div className="mb-4 overflow-x-auto rounded-2xl border border-outline-variant/15">
          <table className="w-full min-w-md text-left text-sm">
            <thead className="bg-surface-container-low text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Variable</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {API_ENV_VARS.map((v) => (
                <tr key={v.name}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{v.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{v.where}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{v.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {section.id === "frontend-clients" ? (
        <ul className="mb-4 space-y-2">
          {API_FRONTEND_CLIENTS.map((c) => (
            <li
              key={c.file}
              className="rounded-xl border border-outline-variant/15 bg-surface-container-low/40 px-4 py-3 text-sm"
            >
              <code className="font-bold text-primary">{c.file}</code>
              <p className="mt-1 text-on-surface-variant">{c.role}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {isCodebase ? (
        <div className="mb-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {API_CODEBASE_REPOS.map((repo) => (
              <div
                key={repo.path}
                className="rounded-2xl border border-outline-variant/15 bg-surface-container-low/50 p-4"
              >
                <h3 className="font-headline font-bold text-on-surface">{repo.name}</h3>
                <p className="mt-1 font-mono text-xs text-primary">{repo.path}</p>
                <p className="mt-2 text-sm text-on-surface-variant">{repo.stack}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/15 transition-colors hover:bg-primary-container"
              type="button"
              onClick={downloadApiReferenceJson}
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Download API reference (JSON)
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-primary px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
              type="button"
              onClick={downloadApiReferenceMarkdown}
            >
              <span className="material-symbols-outlined text-lg">description</span>
              Download API reference (Markdown)
            </button>
          </div>
          <p className="text-xs text-on-surface-variant">
            To download the full codebase, zip or clone the <code className="text-[10px]">code-generator</code> and{" "}
            <code className="text-[10px]">code-generator-backend/ZynQR-Server</code> folders from your machine.
          </p>
        </div>
      ) : null}

      {section.endpoints?.length ? (
        <div className="space-y-4">
          {section.endpoints.map((ep) => (
            <ApiEndpointCard key={ep.id} endpoint={ep} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function TocLink({ section, index, activeId, onNavigate }) {
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

export default function DashboardApiDocs() {
  const [activeId, setActiveId] = useState(API_DOC_SECTIONS[0]?.id ?? "");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const activeSection = useMemo(
    () => API_DOC_SECTIONS.find((s) => s.id === activeId) ?? API_DOC_SECTIONS[0],
    [activeId],
  );

  useEffect(() => {
    const prev = document.title;
    document.title = "API Documentation | ZynQR";
    return () => {
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    function updateActiveFromScroll() {
      let current = API_DOC_SECTIONS[0]?.id ?? "";
      for (const section of API_DOC_SECTIONS) {
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

  return (
    <div className={`${DASHBOARD_PAGE_SHELL} min-w-0`}>
      <header className="max-w-3xl">
        <p className="font-label mb-2 text-xs font-bold tracking-widest text-primary uppercase">Developers</p>
        <h1 className="font-headline mb-3 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          {API_DOCS_INTRO.title}
        </h1>
        <p className="text-base leading-relaxed text-on-surface-variant">{API_DOCS_INTRO.subtitle}</p>
        <p className="mt-3 font-mono text-sm text-primary">
          Base URL: <span className="text-on-surface">{API_DOCS_INTRO.basePath}</span>
        </p>
        <p className="mt-1 text-xs text-on-surface-variant/80">Last updated {API_DOCS_INTRO.updated}</p>
      </header>

      <div className="fixed top-16 right-0 left-0 z-30 border-b border-outline-variant/15 bg-surface-bright/95 shadow-sm backdrop-blur-md lg:hidden">
        <div className="mx-auto w-full max-w-7xl px-4 py-2 md:px-8">
          <button
            aria-expanded={mobileTocOpen}
            className="flex w-full min-h-11 items-center gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-left"
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
              className={`material-symbols-outlined shrink-0 transition-transform ${mobileTocOpen ? "rotate-180" : ""}`}
            >
              expand_more
            </span>
          </button>
          {mobileTocOpen ? (
            <div className="mt-2 max-h-[min(50vh,20rem)] overflow-y-auto rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-2 shadow-lg">
              <ol className="space-y-0.5">
                {API_DOC_SECTIONS.map((s, i) => (
                  <TocLink
                    key={s.id}
                    activeId={activeId}
                    index={i}
                    section={s}
                    onNavigate={() => setMobileTocOpen(false)}
                  />
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>

      <div aria-hidden className="h-17 shrink-0 lg:hidden" />

      <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <nav
          aria-label="API documentation sections"
          className="hidden lg:sticky lg:top-24 lg:col-span-4 lg:block lg:self-start"
        >
          <div className="rounded-4xl border border-outline-variant/15 bg-surface-container-low p-4 sm:p-5">
            <h2 className="font-headline mb-3 px-2 text-sm font-bold text-on-surface">On this page</h2>
            <ol className="space-y-0.5">
              {API_DOC_SECTIONS.map((s, i) => (
                <TocLink key={s.id} activeId={activeId} index={i} section={s} />
              ))}
            </ol>
            <div className="mt-4 border-t border-outline-variant/15 pt-4">
              <button
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-bold text-on-primary"
                type="button"
                onClick={downloadApiReferenceJson}
              >
                <span className="material-symbols-outlined text-sm">download</span>
                JSON
              </button>
              <button
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-full border border-primary px-3 py-2 text-xs font-bold text-primary"
                type="button"
                onClick={downloadApiReferenceMarkdown}
              >
                <span className="material-symbols-outlined text-sm">description</span>
                Markdown
              </button>
              {API_GITHUB_REPO_ROOT ? (
                <a
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface-container-low/80 px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:border-primary/40 hover:bg-primary/5"
                  href={API_GITHUB_REPO_ROOT}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="material-symbols-outlined text-sm">code</span>
                  GitHub
                </a>
              ) : null}
            </div>
          </div>
        </nav>

        <div className="min-w-0 space-y-6 lg:col-span-8">
          {API_DOC_SECTIONS.map((section) => (
            <ApiDocSection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
