import { describe, expect, it } from "vitest";
import { features, hero, howItWorks, seo } from "@/content/site";
import { env } from "@/config/env";
import { futureEndpoints } from "@/config/future-api";

describe("content integrity", () => {
  it("describes shipped product capabilities without coming-soon badges", () => {
    expect(features.length).toBeGreaterThanOrEqual(6);
    expect(hero.eyebrow.toLowerCase()).toContain("gratuito");
    expect(seo.description.toLowerCase()).not.toContain("em breve");
    expect(howItWorks.title.toLowerCase()).toBe("como funciona");
  });

  it("keeps CTAs pointing to real auth routes", () => {
    expect(hero.primaryCta.href).toBe("/criar-conta");
    expect(hero.secondaryCta.href).toBe("/entrar");
  });

  it("exposes public env without inventing analytics ids", () => {
    expect(env.siteName).toBeTruthy();
    // Outside development, unset public URLs stay empty (no hardcoded prod defaults).
    // When set, they must be absolute http(s) URLs.
    if (env.gestaoUrl) {
      expect(env.gestaoUrl).toMatch(/^https?:\/\//);
    }
    expect(env.enableAnalytics).toBe(false);
    expect(env.allowIndexing).toBe(false);
  });

  it("documents future API endpoints without wiring them", () => {
    expect(futureEndpoints.length).toBeGreaterThan(0);
    expect(futureEndpoints.every((item) => item.path.startsWith("/"))).toBe(
      true,
    );
  });
});
