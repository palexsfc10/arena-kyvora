import { env } from "@/config/env";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth-storage";
import type { ApiSuccess } from "@/lib/arena-types";

export class ApiError extends Error {
  status: number;
  errorCode?: string;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

let refreshInFlight: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(`${env.apiBaseUrl}/api/v1/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) return null;
        const json = (await response.json()) as ApiSuccess<{ access_token: string }>;
        const token = json.data?.access_token;
        if (!token) return null;
        setAccessToken(token);
        return token;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const useAuth = options.auth !== false;
  const token = useAuth ? getAccessToken() : null;
  if (useAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const doFetch = async () =>
    fetch(`${env.apiBaseUrl}${path}`, {
      method: options.method ?? "GET",
      credentials: "include",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });

  let response = await doFetch();

  if (response.status === 401 && useAuth && !path.includes("/auth/")) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers.Authorization = `Bearer ${refreshed}`;
      response = await doFetch();
    }
  }

  const json = (await response.json().catch(() => null)) as ApiSuccess<T> | null;

  if (!response.ok) {
    if (response.status === 401) {
      clearAccessToken();
    }
    throw new ApiError(
      json?.message ?? "Não foi possível concluir a solicitação.",
      response.status,
      json?.error_code,
    );
  }

  // Success envelopes may omit `data` (e.g. next-match with no result).
  // Never fall back to the whole JSON object — that crashes callers expecting
  // a domain payload (or null).
  if (json && typeof json === "object" && "success" in json) {
    if ("data" in json) {
      return json.data as T;
    }
    return undefined as T;
  }

  return json as T;
}
