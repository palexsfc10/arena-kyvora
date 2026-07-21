type EventPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Planned analytics events for primary CTAs.
 * No-ops until consent + real IDs are enabled.
 */
export function trackEvent(name: string, payload: EventPayload = {}): void {
  if (typeof window === "undefined") return;

  const consented =
    window.localStorage.getItem("arena-kyvora-analytics-consent") === "granted";

  if (!consented) return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...payload });

  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
  }

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", name, payload);
  }
}
