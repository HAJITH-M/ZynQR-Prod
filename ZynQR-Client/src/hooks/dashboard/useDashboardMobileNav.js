import { useEffect, useState } from "react";

/** Mobile drawer open state + Escape to close and body scroll lock. */
export function useDashboardMobileNav() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;
    function onKeyDown(e) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const toggleMobileNav = () => setMobileNavOpen((o) => !o);
  const closeMobileNav = () => setMobileNavOpen(false);

  return { mobileNavOpen, toggleMobileNav, closeMobileNav, setMobileNavOpen };
}
