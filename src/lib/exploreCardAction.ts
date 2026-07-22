import type { ChallengeContext, ChallengeContextState } from "@/lib/arena-types";
import { formatDisplayDateTime } from "@/lib/formatDisplay";

export type ExploreCardTone = "neutral" | "attention" | "positive";

export type ExploreCardAction = {
  /** Whether a new challenge can be started from this card. */
  canChallenge: boolean;
  /** Short status line shown under availability (null = no relationship). */
  statusLabel: string | null;
  /** Optional supporting line (date/time). */
  detailLabel: string | null;
  /** Primary CTA when challenging is blocked by an active relationship. */
  primaryAction: {
    kind: "view_challenge" | "respond_challenge";
    label: string;
    href: string;
  } | null;
  tone: ExploreCardTone;
  state: ChallengeContextState | "none";
};

const ACTIVE_BLOCKING: ReadonlySet<string> = new Set([
  "outgoing_pending",
  "incoming_pending",
  "pending",
  "accepted",
  "awaiting_reconfirmation",
]);

function formatSlot(
  proposedDate: string | null | undefined,
  proposedTime: string | null | undefined,
): string | null {
  const label = formatDisplayDateTime(proposedDate, proposedTime);
  return label || null;
}

function challengeHref(challengeId: string | null | undefined): string {
  if (!challengeId) return "/app/desafios";
  return `/app/desafios?challenge=${encodeURIComponent(challengeId)}`;
}

/**
 * Maps explore `challenge_context` to the single primary action the card
 * should offer. Active relationships never compete with "Desafiar".
 *
 * Terminal states (declined / cancelled / expired) and `none` allow a new
 * challenge — matching product rules where history is not a permanent block.
 */
export function resolveExploreCardAction(
  ctx: ChallengeContext | null | undefined,
): ExploreCardAction {
  if (!ctx || ctx.state === "none") {
    return {
      canChallenge: true,
      statusLabel: null,
      detailLabel: null,
      primaryAction: null,
      tone: "neutral",
      state: "none",
    };
  }

  const slot = formatSlot(ctx.proposed_date, ctx.proposed_time);
  const href = challengeHref(ctx.challenge_id);
  const state = ctx.state;

  if (state === "incoming_pending" || (state === "pending" && ctx.direction === "received")) {
    return {
      canChallenge: false,
      statusLabel: "Desafio recebido",
      detailLabel: slot ? `Aguardando sua resposta · ${slot}` : "Aguardando sua resposta",
      primaryAction: {
        kind: "respond_challenge",
        label: "Responder desafio",
        href,
      },
      tone: "attention",
      state: "incoming_pending",
    };
  }

  if (state === "awaiting_reconfirmation") {
    return {
      canChallenge: false,
      statusLabel: "Aguardando reconfirmação",
      detailLabel: slot,
      primaryAction: {
        kind: "respond_challenge",
        label: "Ver desafio",
        href,
      },
      tone: "attention",
      state: "awaiting_reconfirmation",
    };
  }

  if (state === "outgoing_pending" || state === "pending") {
    return {
      canChallenge: false,
      statusLabel: "Desafio enviado",
      detailLabel: slot ? `Aguardando resposta · ${slot}` : "Aguardando resposta",
      primaryAction: {
        kind: "view_challenge",
        label: "Ver desafio",
        href,
      },
      tone: "attention",
      state: "outgoing_pending",
    };
  }

  if (state === "accepted") {
    return {
      canChallenge: false,
      statusLabel: "Desafio confirmado",
      detailLabel: slot,
      primaryAction: {
        kind: "view_challenge",
        label: "Ver desafio",
        href,
      },
      tone: "positive",
      state: "accepted",
    };
  }

  // Terminal / unknown: allow a fresh challenge.
  if (!ACTIVE_BLOCKING.has(state)) {
    return {
      canChallenge: true,
      statusLabel: null,
      detailLabel: null,
      primaryAction: null,
      tone: "neutral",
      state,
    };
  }

  return {
    canChallenge: false,
    statusLabel: "Desafio em andamento",
    detailLabel: slot,
    primaryAction: {
      kind: "view_challenge",
      label: "Ver desafio",
      href,
    },
    tone: "attention",
    state,
  };
}
