/* ── Auth Cookie Helpers (client-side) ───────────────────── *
 * Sets/clears a lightweight __feel_authed cookie so the     *
 * middleware can do optimistic route protection without      *
 * calling Firebase on every request.                        *
 * ────────────────────────────────────────────────────────── */

const COOKIE_NAME = "__feel_authed";
const MAX_AGE     = 60 * 60 * 24 * 7; // 7 days

export function setAuthCookie() {
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function clearAuthCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
