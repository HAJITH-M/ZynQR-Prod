import { useScrollToTopOnNavigate } from "../hooks/useScrollToTopOnNavigate";

/** Resets document scroll on client-side navigation. */
export default function ScrollToTop() {
  useScrollToTopOnNavigate();
  return null;
}
