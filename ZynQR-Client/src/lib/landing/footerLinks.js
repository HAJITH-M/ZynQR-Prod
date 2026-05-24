/** @typedef {{ label: string; to?: string; href?: string }} FooterLinkItem */

/** @typedef {{ title: string; items: FooterLinkItem[] }} FooterLinkGroup */

/** @type {FooterLinkGroup[]} */
export const LANDING_FOOTER_LINK_GROUPS = [
  {
    title: "Product",
    items: [
      { label: "Features", to: "/features" },
      { label: "API & integrations", to: "/api" },
      { label: "Pricing", to: "/pricing" },
      { label: "API Documentation", to: "/dashboard/api-docs" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "User Guide", to: "/dashboard/guide" },
      { label: "Sign in", to: "/login" },
      { label: "Create account", to: "/register" },
      { label: "Security", to: "/dashboard/security" },
    ],
  },
  {
    title: "Contact",
    items: [{ label: "Contact us", to: "/contact" }],
  },
];

export const LANDING_FOOTER_SOCIAL = [{ icon: "language", href: "/", label: "Website" }];
