/**
 * Single visible initial for avatar-style UI (prefers display_name, then email).
 * @param {{ display_name?: string; email?: string } | null | undefined} me — `/auth/me` payload (or similar).
 */
export function userInitialFromMe(me) {
  const name = String(me?.display_name ?? "").trim();
  if (name) {
    const ch = [...name][0];
    return ch ? ch.toLocaleUpperCase() : "?";
  }
  const email = String(me?.email ?? "").trim();
  if (email) {
    const ch = [...email][0];
    return ch ? ch.toLocaleUpperCase() : "?";
  }
  if (typeof localStorage !== "undefined") {
    const stored = String(localStorage.getItem("email") ?? "").trim();
    if (stored) {
      const ch = [...stored][0];
      return ch ? ch.toLocaleUpperCase() : "?";
    }
  }
  return "?";
}
