const ACCESS_TOKEN_KEY = "arena_kyvora_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore
  }
}
