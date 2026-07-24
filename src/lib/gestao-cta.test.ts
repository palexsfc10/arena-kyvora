import { describe, expect, it } from "vitest";
import {
  GESTAO_CTA_UTM,
  buildGestaoManagementUrl,
  gestaoDestinationLabel,
} from "@/lib/gestao-cta";

describe("gestao-cta", () => {
  it("builds Gestão URL from env base with required UTMs", () => {
    const href = buildGestaoManagementUrl("https://hml.kyvoraapp.com.br");
    expect(href).toBeTruthy();
    const url = new URL(href!);
    expect(url.origin).toBe("https://hml.kyvoraapp.com.br");
    expect(url.searchParams.get("utm_source")).toBe(GESTAO_CTA_UTM.source);
    expect(url.searchParams.get("utm_medium")).toBe(GESTAO_CTA_UTM.medium);
    expect(url.searchParams.get("utm_campaign")).toBe(GESTAO_CTA_UTM.campaign);
    expect(url.searchParams.get("utm_content")).toBe(GESTAO_CTA_UTM.content);
  });

  it("returns null for empty or invalid base URL", () => {
    expect(buildGestaoManagementUrl("")).toBeNull();
    expect(buildGestaoManagementUrl("   ")).toBeNull();
    expect(buildGestaoManagementUrl("not-a-url")).toBeNull();
  });

  it("exposes hostname only for analytics destination", () => {
    expect(gestaoDestinationLabel("https://hml.kyvoraapp.com.br/path")).toBe(
      "hml.kyvoraapp.com.br",
    );
  });

  it("does not embed tokens, emails, or private team data", () => {
    const href = buildGestaoManagementUrl("https://hml.kyvoraapp.com.br")!;
    expect(href).not.toMatch(/token|email|password|organization_id|Bearer/i);
  });

  it("marks authenticated CTAs for Gestão session handoff without secrets", () => {
    const href = buildGestaoManagementUrl("https://hml.kyvoraapp.com.br")!;
    const url = new URL(href);
    expect(url.searchParams.get("kyvora_entry")).toBe("arena_session");
  });

  it("allows disabling session handoff for non-auth surfaces", () => {
    const href = buildGestaoManagementUrl("https://hml.kyvoraapp.com.br", {
      content: "marketing",
      sessionHandoff: false,
    })!;
    const url = new URL(href);
    expect(url.searchParams.get("kyvora_entry")).toBeNull();
  });

  it("accepts UTM overrides for campaign surfaces", () => {
    const href = buildGestaoManagementUrl("https://hml.kyvoraapp.com.br", {
      content: "top_promo",
      medium: "app",
      campaign: "mobile_explore",
    })!;
    const url = new URL(href);
    expect(url.searchParams.get("utm_medium")).toBe("app");
    expect(url.searchParams.get("utm_campaign")).toBe("mobile_explore");
    expect(url.searchParams.get("utm_content")).toBe("top_promo");
  });
});
