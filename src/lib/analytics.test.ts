import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetAnalyticsPageViewMemoryForTests,
  ANALYTICS_CONSENT_KEY,
  sanitizeAnalyticsPayload,
  trackEvent,
  trackPageView,
  writeAnalyticsConsent,
} from "@/lib/analytics";

vi.mock("@/config/env", () => ({
  env: {
    enableAnalytics: true,
    googleAnalyticsId: "G-WQTRFL6M1J",
    metaPixelId: "",
  },
}));

describe("analytics privacy and SPA page views", () => {
  beforeEach(() => {
    __resetAnalyticsPageViewMemoryForTests();
    window.localStorage.clear();
    window.dataLayer = [];
    window.gtag = vi.fn();
    window.__arenaGaConfigured = undefined;
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("strips phone, message, email and similar PII from payloads", () => {
    const clean = sanitizeAnalyticsPayload({
      placement: "authenticated_header",
      phone: "11999999999",
      contact_phone: "+5511999",
      email: "a@b.com",
      message: "olá time",
      comment: "segredo",
      organization_name: "Time X",
      viewport: "desktop",
      origin: "arena",
    });
    expect(clean).toEqual({
      placement: "authenticated_header",
      viewport: "desktop",
      origin: "arena",
    });
  });

  it("does not emit events without consent", () => {
    trackEvent("explore_viewed", { phone: "1199" });
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it("emits sanitized events after consent", () => {
    writeAnalyticsConsent("granted");
    trackEvent("paid_kyvora_cta_clicked", {
      placement: "authenticated_header",
      viewport: "desktop",
      origin: "arena",
      phone: "11999999999",
    });
    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "paid_kyvora_cta_clicked",
      expect.not.objectContaining({ phone: expect.anything() }),
    );
    const payload = vi.mocked(window.gtag!).mock.calls[0][2] as Record<
      string,
      unknown
    >;
    expect(payload).toEqual({
      placement: "authenticated_header",
      viewport: "desktop",
      origin: "arena",
    });
  });

  it("does not duplicate SPA page_view for the same path", () => {
    writeAnalyticsConsent("granted");
    trackPageView("/app/explorar");
    trackPageView("/app/explorar");
    trackPageView("/app/desafios");
    const pageViews = vi
      .mocked(window.gtag!)
      .mock.calls.filter((call) => call[0] === "event" && call[1] === "page_view");
    expect(pageViews).toHaveLength(2);
  });

  it("stores consent under the known LGPD key", () => {
    writeAnalyticsConsent("denied");
    expect(window.localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("denied");
  });
});
