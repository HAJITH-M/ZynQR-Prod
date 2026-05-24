import { Link } from "react-router-dom";
import { LANDING_FOOTER_LINK_GROUPS, LANDING_FOOTER_SOCIAL } from "../../lib/landing/footerLinks";

function FooterLinkItem({ item }) {
  const className = "hover:text-primary";
  if (item.to) {
    return (
      <Link className={className} to={item.to}>
        {item.label}
      </Link>
    );
  }
  return (
    <a className={className} href={item.href ?? "#"}>
      {item.label}
    </a>
  );
}

export default function LandingFooter() {
  return (
    <footer className="bg-surface-container-low px-8 py-20">
      <div className="container mx-auto grid grid-cols-2 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2">
          <Link className="mb-6 block text-3xl font-black tracking-tighter text-primary" to="/">
            ZynQR
          </Link>
          <p className="mb-8 max-w-xs text-on-surface-variant">
            Redefining the relationship between physical products and digital intelligence.
          </p>
          <div className="flex gap-4">
            {LANDING_FOOTER_SOCIAL.map((s) => (
              <a
                key={s.icon}
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high transition-all hover:bg-primary hover:text-white"
                href={s.href}
              >
                <span className="material-symbols-outlined text-sm">{s.icon}</span>
              </a>
            ))}
          </div>
        </div>
        {LANDING_FOOTER_LINK_GROUPS.map((group) => (
          <div key={group.title}>
            <h4 className="font-headline mb-6 font-bold">{group.title}</h4>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              {group.items.map((item) => (
                <li key={item.label}>
                  <FooterLinkItem item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container mx-auto mt-20 border-t border-outline-variant/30 pt-10 text-center">
        <span className="text-sm text-on-surface-variant">
          © 2026 ZynQR Precision QR. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
