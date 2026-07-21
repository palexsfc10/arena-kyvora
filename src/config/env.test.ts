import { describe, expect, it } from "vitest";
import { env } from "@/config/env";

describe("env config", () => {
  it("exposes API base URL for Arena client", () => {
    expect(env.apiBaseUrl).toBeTruthy();
    expect(env.siteUrl).toBeTruthy();
    expect(env.gestaoUrl).toBeTruthy();
  });
});
