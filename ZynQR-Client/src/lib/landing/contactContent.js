/** @typedef {{ value: string; label: string }} ContactTopic */

/** @type {ContactTopic[]} */
export const CONTACT_TOPICS = [
  { value: "general", label: "General question" },
  { value: "account", label: "Account & sign-in" },
  { value: "billing", label: "Pricing & plans" },
  { value: "api", label: "API & integrations" },
  { value: "security", label: "Security & privacy" },
  { value: "bug", label: "Bug or technical issue" },
];

/** @type {{ icon: string; title: string; description: string; to?: string; href?: string }[]} */
export const CONTACT_QUICK_LINKS = [
  {
    icon: "menu_book",
    title: "User Guide",
    description: "Step-by-step help for the dashboard, QRs, and analytics.",
    to: "/dashboard/guide",
  },
  {
    icon: "code",
    title: "API documentation",
    description: "Endpoints, auth, and examples for developers.",
    to: "/dashboard/api-docs",
  },
  {
    icon: "shield",
    title: "Security settings",
    description: "Sessions, 2FA, and audit log in your account.",
    to: "/dashboard/security",
  },
];
