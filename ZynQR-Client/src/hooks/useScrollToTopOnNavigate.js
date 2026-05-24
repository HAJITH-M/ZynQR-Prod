import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scroll document to top when route location changes. */
export function useScrollToTopOnNavigate() {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search, hash]);
}
