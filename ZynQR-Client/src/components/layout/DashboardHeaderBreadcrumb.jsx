import { Fragment } from "react";
import { Link } from "react-router-dom";
import { resolveDashboardBreadcrumbs } from "../../lib/dashboard/breadcrumbs.js";

const linkClass =
  "font-medium text-on-surface/70 transition-colors duration-200 hover:text-primary-container";

const separatorClass = "select-none text-on-surface-variant/70";

const currentClass = "font-semibold text-on-surface";

const currentTruncateClass =
  "max-w-[min(14rem,32vw)] truncate font-semibold text-on-surface";

/**
 * @param {{ pathname: string; editQrId?: string; analyticsQrId?: string; editTitle?: string; analyticsTitle?: string }} props
 */
export default function DashboardHeaderBreadcrumb({
  pathname,
  editQrId,
  analyticsQrId,
  editTitle,
  analyticsTitle,
}) {
  const segments = resolveDashboardBreadcrumbs(pathname, {
    editQrId,
    analyticsQrId,
    editTitle,
    analyticsTitle,
  });

  if (!segments?.length) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {segments.map((seg, i) => (
          <Fragment key={`${seg.label}-${i}`}>
            {i > 0 ? (
              <li className={separatorClass} aria-hidden="true">
                /
              </li>
            ) : null}
            <li
              className={
                seg.current
                  ? seg.truncate
                    ? currentTruncateClass
                    : currentClass
                  : undefined
              }
              aria-current={seg.current ? "page" : undefined}
              title={seg.title}
            >
              {seg.to && !seg.current ? (
                <Link className={linkClass} to={seg.to}>
                  {seg.label}
                </Link>
              ) : (
                seg.label
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
