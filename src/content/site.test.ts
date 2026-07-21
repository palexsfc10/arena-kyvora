import { describe, expect, it } from "vitest";
import { features, hero, statusLabel } from "@/content/site";
import { env } from "@/config/env";
import { futureEndpoints } from "@/config/future-api";

describe("content integrity", () => {
  it("keeps all planned features marked as coming soon", () => {
    expect(features.length).toBeGreaterThanOrEqual(7);
    expect(features.every((feature) => feature.status === "coming-soon")).toBe(
      true,
    );
    expect(statusLabel).toBe("Em breve");
  });

  it("states the product is in development in the hero", () => {
    expect(hero.eyebrow.toLowerCase()).toContain("desenvolvimento");
  });

  it("exposes public env without inventing analytics ids", () => {
    expect(env.siteName).toBeTruthy();
    expect(env.gestaoUrl).toMatch(/^https?:\/\//);
  });

  it("documents future API endpoints without wiring them", () => {
    expect(futureEndpoints.length).toBeGreaterThan(0);
    expect(futureEndpoints.every((item) => item.path.startsWith("/"))).toBe(
      true,
    );
  });
});
