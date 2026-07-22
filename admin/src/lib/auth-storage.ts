const ACCESS_TOKEN_KEY = "arena_admin_access_token";

/**
 * Access token storage for the Arena Admin panel.
 *
 * Uses `sessionStorage` (not `localStorage`) on purpose: admin sessions
 * should not silently persist across browser restarts on shared machines.
 * Refresh is handled server-side via an httpOnly cookie sent with
 * `credentials: include` — see `api-client.ts`.
 */
export function getAccessToken(): string | null {
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAccessToken(token: string): void {
  try {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // Storage unavailable (e.g. private mode edge cases) — fail silently,
    // the token will simply live only in memory for this request cycle.
  }
}

export function clearStoredAccessToken(): void {
  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // no-op
  }
}
