import { afterEach, describe, expect, it, vi } from "vitest";

describe("env config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("inlines literal NEXT_PUBLIC_* keys (not dynamic process.env[name])", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://hml-arena.kyvoraapp.com.br");
    vi.stubEnv(
      "NEXT_PUBLIC_KYVORA_API_BASE_URL",
      "https://hml-api.kyvoraapp.com.br",
    );
    vi.stubEnv("NEXT_PUBLIC_GESTAO_URL", "https://hml.kyvoraapp.com.br");

    const { env } = await import("@/config/env");

    expect(env.siteUrl).toBe("https://hml-arena.kyvoraapp.com.br");
    expect(env.apiBaseUrl).toBe("https://hml-api.kyvoraapp.com.br");
    expect(env.gestaoUrl).toBe("https://hml.kyvoraapp.com.br");
  });

  it("uses empty defaults outside development when public env is unset", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_KYVORA_API_BASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_GESTAO_URL", "");

    const { env } = await import("@/config/env");

    expect(env.siteUrl).toBe("");
    expect(env.apiBaseUrl).toBe("");
    expect(env.gestaoUrl).toBe("");
  });
});
