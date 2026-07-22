/**
 * Local dismiss preferences for Gestão promo surfaces.
 * Keep rules simple: per-surface cooldown + shared high-emphasis session flag.
 */

export const PROMO_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
/** Explore mobile top promo — shorter window (strategic conversion surface). */
export const PROMO_DISMISS_MS_MOBILE_TOP = 3 * 24 * 60 * 60 * 1000;

export type PromoSurface =
  | "login"
  | "explore"
  | "explore_mobile_top"
  | "my_team"
  | "header"
  | "challenge_confirmed";

const KEYS: Record<PromoSurface, string> = {
  login: "arena_gestao_promo_login_until",
  explore: "arena_gestao_promo_dismissed_until",
  explore_mobile_top: "arena_gestao_promo_explore_mobile_top_until",
  my_team: "arena_gestao_promo_my_team_until",
  header: "arena_gestao_promo_header_until",
  challenge_confirmed: "arena_gestao_promo_challenge_until",
};

const SESSION_HIGHLIGHT_KEY = "arena_gestao_promo_highlight_shown";

export function isPromoDismissed(surface: PromoSurface): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(KEYS[surface]);
    if (!raw) return false;
    const until = Number(raw);
    return Number.isFinite(until) && Date.now() < until;
  } catch {
    return false;
  }
}

export function dismissPromo(surface: PromoSurface, ms: number = PROMO_DISMISS_MS): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEYS[surface], String(Date.now() + ms));
  } catch {
    // ignore
  }
}

export function wasHighlightShownThisSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SESSION_HIGHLIGHT_KEY) === "1";
  } catch {
    return false;
  }
}

export function markHighlightShownThisSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_HIGHLIGHT_KEY, "1");
  } catch {
    // ignore
  }
}

export function clearPromoDismissForTests(surface: PromoSurface): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEYS[surface]);
    window.sessionStorage.removeItem(SESSION_HIGHLIGHT_KEY);
  } catch {
    // ignore
  }
}
