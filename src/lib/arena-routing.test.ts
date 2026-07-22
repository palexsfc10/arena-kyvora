import { describe, expect, it } from "vitest";
import { routeAfterSession } from "@/lib/arena-routing";
import type { ArenaSession } from "@/lib/arena-types";

function baseSession(partial: Partial<ArenaSession> = {}): ArenaSession {
  return {
    user_id: "u1",
    user_name: "Teste",
    user_email: "t@example.com",
    teams: [],
    selected_organization_id: null,
    selected_role: null,
    can_manage_selected: false,
    gestao_url: "http://localhost:5173",
    ...partial,
  };
}

describe("routeAfterSession", () => {
  it("sends users without team to create team", () => {
    expect(routeAfterSession(baseSession())).toBe("/app/criar-time");
  });

  it("asks activation when team is not arena-enabled", () => {
    const session = baseSession({
      teams: [
        {
          organization_id: "o1",
          name: "FC",
          slug: "fc",
          city: "SP",
          state: "SP",
          modality: "futsal",
          logo_url: null,
          role: "organization_admin",
          can_manage: true,
          arena_enabled: false,
          discoverable: false,
        },
      ],
      selected_organization_id: "o1",
      can_manage_selected: true,
    });
    expect(routeAfterSession(session)).toBe("/app/ativar-participacao");
  });

  it("goes to explore when arena is enabled", () => {
    const session = baseSession({
      teams: [
        {
          organization_id: "o1",
          name: "FC",
          slug: "fc",
          city: "SP",
          state: "SP",
          modality: "futsal",
          logo_url: null,
          role: "organization_admin",
          can_manage: true,
          arena_enabled: true,
          discoverable: true,
        },
      ],
      selected_organization_id: "o1",
    });
    expect(routeAfterSession(session)).toBe("/app/explorar");
  });
});
