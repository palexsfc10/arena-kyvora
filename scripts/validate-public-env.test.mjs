import { describe, expect, it } from "vitest";
import { validatePublicEnv } from "./validate-public-env.mjs";

const HML = {
  NEXT_PUBLIC_SITE_URL: "https://hml-arena.kyvoraapp.com.br",
  NEXT_PUBLIC_KYVORA_API_BASE_URL: "https://hml-api.kyvoraapp.com.br",
  NEXT_PUBLIC_GESTAO_URL: "https://hml.kyvoraapp.com.br",
  NEXT_PUBLIC_ALLOW_INDEXING: "false",
  NEXT_PUBLIC_ENABLE_ANALYTICS: "false",
};

const PRD = {
  NEXT_PUBLIC_SITE_URL: "https://arena.kyvoraapp.com.br",
  NEXT_PUBLIC_KYVORA_API_BASE_URL: "https://api.kyvoraapp.com.br",
  NEXT_PUBLIC_GESTAO_URL: "https://app.kyvoraapp.com.br",
  NEXT_PUBLIC_ALLOW_INDEXING: "false",
  NEXT_PUBLIC_ENABLE_ANALYTICS: "false",
};

describe("validatePublicEnv", () => {
  it("accepts a valid HML configuration", () => {
    const result = validatePublicEnv({ ...HML });
    expect(result.site).toBe(HML.NEXT_PUBLIC_SITE_URL);
    expect(result.allowIndexing).toBe(false);
    expect(result.enableAnalytics).toBe(false);
  });

  it("accepts a valid PRD configuration", () => {
    const result = validatePublicEnv({ ...PRD });
    expect(result.api).toBe(PRD.NEXT_PUBLIC_KYVORA_API_BASE_URL);
    expect(result.gestao).toBe(PRD.NEXT_PUBLIC_GESTAO_URL);
  });

  it("rejects missing required variables", () => {
    expect(() =>
      validatePublicEnv({
        ...HML,
        NEXT_PUBLIC_SITE_URL: "",
      }),
    ).toThrow(/required/i);

    expect(() =>
      validatePublicEnv({
        NEXT_PUBLIC_SITE_URL: HML.NEXT_PUBLIC_SITE_URL,
        NEXT_PUBLIC_KYVORA_API_BASE_URL: HML.NEXT_PUBLIC_KYVORA_API_BASE_URL,
        NEXT_PUBLIC_GESTAO_URL: HML.NEXT_PUBLIC_GESTAO_URL,
      }),
    ).toThrow(/ALLOW_INDEXING/i);
  });

  it("rejects localhost URLs", () => {
    expect(() =>
      validatePublicEnv({
        ...HML,
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      }),
    ).toThrow(/localhost/i);
  });

  it("rejects PRD site pointing at HML backends", () => {
    expect(() =>
      validatePublicEnv({
        ...PRD,
        NEXT_PUBLIC_KYVORA_API_BASE_URL: HML.NEXT_PUBLIC_KYVORA_API_BASE_URL,
      }),
    ).toThrow(/Production Arena requires/i);
  });

  it("rejects HML site pointing at PRD backends", () => {
    expect(() =>
      validatePublicEnv({
        ...HML,
        NEXT_PUBLIC_KYVORA_API_BASE_URL: PRD.NEXT_PUBLIC_KYVORA_API_BASE_URL,
      }),
    ).toThrow(/HML Arena requires|must not use production/i);
  });

  it("rejects HML with indexing enabled", () => {
    expect(() =>
      validatePublicEnv({
        ...HML,
        NEXT_PUBLIC_ALLOW_INDEXING: "true",
      }),
    ).toThrow(/ALLOW_INDEXING=false/i);
  });

  it("rejects analytics enabled without public IDs", () => {
    expect(() =>
      validatePublicEnv({
        ...HML,
        NEXT_PUBLIC_ENABLE_ANALYTICS: "true",
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "",
        NEXT_PUBLIC_META_PIXEL_ID: "",
      }),
    ).toThrow(/GA_MEASUREMENT_ID|META_PIXEL_ID/i);
  });

  it("accepts analytics enabled when a public ID is present", () => {
    const result = validatePublicEnv({
      ...PRD,
      NEXT_PUBLIC_ENABLE_ANALYTICS: "true",
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TESTONLY",
    });
    expect(result.enableAnalytics).toBe(true);
  });
});
