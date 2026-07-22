import axios, { AxiosError } from "axios";

import {
  clearStoredAccessToken,
  getAccessToken,
  setStoredAccessToken,
} from "./auth-storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const PUBLIC_PATHS = ["/login"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

export interface ApiErrorPayload {
  success?: boolean;
  message?: string;
  error_code?: string;
  errors?: Array<{ field?: string; message?: string }>;
}

export class ApiError extends Error {
  status: number;
  errorCode?: string;
  fieldErrors: Record<string, string>;

  constructor(
    message: string,
    status: number,
    errorCode?: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = errorCode;
    this.fieldErrors = fieldErrors;
  }
}

export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiErrorPayload;
    const fieldErrors: Record<string, string> = {};
    for (const item of data.errors ?? []) {
      if (item.field) {
        fieldErrors[item.field] = item.message ?? "Valor inválido.";
      }
    }
    return new ApiError(
      data.message ?? "Não foi possível concluir a operação.",
      error.response.status,
      data.error_code,
      fieldErrors,
    );
  }
  if (axios.isAxiosError(error) && error.request) {
    return new ApiError("Não foi possível conectar ao servidor.", 0);
  }
  return new ApiError("Ocorreu um erro inesperado.", 0);
}

/**
 * Axios instance for the Arena Admin panel.
 *
 * - Sends the bearer token (from sessionStorage) on every request.
 * - Sends cookies (`withCredentials`) so the backend's httpOnly refresh
 *   cookie is included, in case the API supports silent refresh.
 * - On any 401 response, the stored session is cleared and the user is
 *   redirected to /login (unless already there).
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAccessToken(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

export function bootstrapAccessToken(): string | null {
  const stored = getAccessToken();
  setAccessToken(stored);
  return stored;
}

export function persistAccessToken(token: string): void {
  setStoredAccessToken(token);
  setAccessToken(token);
}

function handleUnauthorized(): void {
  clearStoredAccessToken();
  setAccessToken(null);
  const pathname = window.location.pathname;
  if (!isPublicPath(pathname)) {
    const redirect = encodeURIComponent(pathname + window.location.search);
    window.location.assign(`/login?redirect=${redirect}`);
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    return Promise.reject(parseApiError(error));
  },
);
