import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiError, apiRequest } from "@/lib/api-client";
import { setAccessToken, clearAccessToken } from "@/lib/auth-storage";

describe("api client", () => {
  beforeEach(() => {
    clearAccessToken();
    vi.restoreAllMocks();
  });

  it("attaches bearer token and parses success envelope", async () => {
    setAccessToken("test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: "ok",
          data: { hello: "world" },
        }),
      }),
    );

    const data = await apiRequest<{ hello: string }>("/api/v1/arena/session");
    expect(data.hello).toBe("world");
    expect(fetch).toHaveBeenCalled();
    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer test-token",
    );
  });

  it("throws ApiError on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          message: "Negado",
          error_code: "FORBIDDEN",
        }),
      }),
    );

    await expect(apiRequest("/api/v1/arena/explore")).rejects.toBeInstanceOf(ApiError);
  });

  it("returns undefined when success envelope omits data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: "Próxima partida.",
        }),
      }),
    );

    const data = await apiRequest<{ challenge_id: string } | undefined>(
      "/api/v1/arena/teams/x/next-match",
    );
    expect(data).toBeUndefined();
  });

  it("preserves explicit null data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: "Próxima partida.",
          data: null,
        }),
      }),
    );

    const data = await apiRequest<null>("/api/v1/arena/teams/x/next-match");
    expect(data).toBeNull();
  });
});
