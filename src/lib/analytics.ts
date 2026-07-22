/**
 * Central analytics for Arena Kyvora (GA4 + optional Meta).
 *
 * Privacy: never send phone, email, names, messages, comments, JWT, coords,
 * or any personal/team-identifying content. Only generic controlled params.
 */

import { env } from "@/config/env";

export const ANALYTICS_CONSENT_KEY = "arena-kyvora-analytics-consent";

export type AnalyticsConsent = "granted" | "denied" | "unknown";

type EventPayload = Record<string, string | number | boolean | undefined>;

/** Keys that must never leave the client toward analytics vendors. */
const FORBIDDEN_PAYLOAD_KEYS = new Set([
  "phone",
  "contact_phone",
  "telefone",
  "email",
  "user_email",
  "name",
  "user_name",
  "full_name",
  "nome",
  "message",
  "mensagem",
  "comment",
  "comentario",
  "body",
  "address",
  "endereco",
  "lat",
  "lng",
  "latitude",
  "longitude",
  "token",
  "jwt",
  "access_token",
  "password",
  "senha",
  "organization_name",
  "team_name",
  "opponent",
  "challenge_id",
  "user_id",
  "organization_id",
]);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    __arenaGaConfigured?: boolean;
  }
}

let lastPagePath: string | null = null;

export function isAnalyticsRuntimeAllowed(): boolean {
  // Disabled unless explicitly enabled via env (tests should leave it false
  // unless they mock env). Scripts are never injected without consent + ID.
  return env.enableAnalytics && Boolean(env.googleAnalyticsId || env.metaPixelId);
}

export function readAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return "unknown";
  const stored = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  if (stored === "granted" || stored === "denied") return stored;
  return "unknown";
}

export function writeAnalyticsConsent(value: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
}

/** Strip forbidden / PII-looking keys and empty values. */
export function sanitizeAnalyticsPayload(payload: EventPayload): EventPayload {
  const clean: EventPayload = {};
  for (const [key, value] of Object.entries(payload)) {
    const normalized = key.trim().toLowerCase();
    if (FORBIDDEN_PAYLOAD_KEYS.has(normalized)) continue;
    if (/phone|email|token|jwt|password|message|comment|nome|name|lat|lng/.test(normalized)) {
      continue;
    }
    if (value === undefined) continue;
    if (typeof value === "string" && value.length > 80) continue;
    clean[key] = value;
  }
  return clean;
}

export function trackEvent(name: string, payload: EventPayload = {}): void {
  if (typeof window === "undefined") return;
  if (!isAnalyticsRuntimeAllowed()) return;
  if (readAnalyticsConsent() !== "granted") return;

  const safe = sanitizeAnalyticsPayload(payload);

  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event: name, ...safe });

    if (typeof window.gtag === "function") {
      window.gtag("event", name, safe);
    }

    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", name, safe);
    }
  } catch {
    // Ad blockers / vendor failures must never break UX.
  }
}

/**
 * SPA page_view once per distinct path. Call after GA config with
 * send_page_view: false to avoid duplicates with the automatic hit.
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === "undefined") return;
  if (!isAnalyticsRuntimeAllowed()) return;
  if (readAnalyticsConsent() !== "granted") return;
  if (!env.googleAnalyticsId) return;
  if (path === lastPagePath) return;
  lastPagePath = path;

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: path,
        page_title: title ?? document.title,
        page_location: `${window.location.origin}${path}`,
      });
    }
  } catch {
    // ignore
  }
}

/** Test helper — resets SPA page_view dedupe. */
export function __resetAnalyticsPageViewMemoryForTests(): void {
  lastPagePath = null;
}
