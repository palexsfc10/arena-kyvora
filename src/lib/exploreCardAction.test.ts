import { describe, expect, it } from "vitest";
import { resolveExploreCardAction } from "@/lib/exploreCardAction";
import type { ChallengeContext } from "@/lib/arena-types";

function ctx(
  partial: Partial<ChallengeContext> & Pick<ChallengeContext, "state">,
): ChallengeContext {
  return {
    challenge_id: "chal-1",
    proposed_date: "2026-07-24",
    proposed_time: "20:00:00",
    direction: "sent",
    ...partial,
  };
}

describe("resolveExploreCardAction", () => {
  it("allows Desafiar when there is no active relationship", () => {
    const action = resolveExploreCardAction({ state: "none", challenge_id: null, proposed_date: null, proposed_time: null, direction: null });
    expect(action.canChallenge).toBe(true);
    expect(action.primaryAction).toBeNull();
    expect(action.statusLabel).toBeNull();
  });

  it("blocks Desafiar for confirmed (accepted) and offers Ver desafio", () => {
    const action = resolveExploreCardAction(ctx({ state: "accepted", direction: "sent" }));
    expect(action.canChallenge).toBe(false);
    expect(action.statusLabel).toBe("Desafio confirmado");
    expect(action.detailLabel).toMatch(/24 de julho/);
    expect(action.detailLabel).toMatch(/às 20h/);
    expect(action.detailLabel).not.toMatch(/:00:00/);
    expect(action.primaryAction?.label).toBe("Ver desafio");
    expect(action.primaryAction?.href).toBe("/app/desafios?challenge=chal-1");
    expect(action.tone).toBe("positive");
  });

  it("blocks Desafiar for outgoing pending", () => {
    const action = resolveExploreCardAction(ctx({ state: "outgoing_pending" }));
    expect(action.canChallenge).toBe(false);
    expect(action.statusLabel).toBe("Desafio enviado");
    expect(action.primaryAction?.label).toBe("Ver desafio");
  });

  it("highlights incoming pending with Responder desafio", () => {
    const action = resolveExploreCardAction(
      ctx({ state: "incoming_pending", direction: "received" }),
    );
    expect(action.canChallenge).toBe(false);
    expect(action.statusLabel).toBe("Desafio recebido");
    expect(action.primaryAction?.label).toBe("Responder desafio");
    expect(action.tone).toBe("attention");
  });

  it("allows Desafiar again after cancelled / declined / expired", () => {
    for (const state of ["cancelled", "declined", "expired"] as const) {
      const action = resolveExploreCardAction(ctx({ state }));
      expect(action.canChallenge, state).toBe(true);
      expect(action.primaryAction, state).toBeNull();
    }
  });

  it("never pairs Desafiar with an active primary action", () => {
    const states: ChallengeContext["state"][] = [
      "outgoing_pending",
      "incoming_pending",
      "accepted",
      "awaiting_reconfirmation",
    ];
    for (const state of states) {
      const action = resolveExploreCardAction(
        ctx({
          state,
          direction: state === "incoming_pending" ? "received" : "sent",
        }),
      );
      expect(action.canChallenge && action.primaryAction, state).toBeFalsy();
      expect(action.canChallenge || action.primaryAction, state).toBeTruthy();
    }
  });
});
