"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";
import type { CreateRatingPayload } from "@/lib/arena-types";
import { cn } from "@/lib/cn";

type RatingKey = "overall" | "punctuality" | "organization_score" | "fair_play" | "communication";

const RATING_FIELDS: Array<{ key: RatingKey; label: string }> = [
  { key: "overall", label: "Avaliação geral" },
  { key: "punctuality", label: "Pontualidade" },
  { key: "organization_score", label: "Organização" },
  { key: "fair_play", label: "Fair play" },
  { key: "communication", label: "Comunicação" },
];

const DEFAULT_SCORE = 3;

function StarRow({
  value,
  onChange,
  disabled,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-ink-soft">{label}</span>
      <div className="flex gap-1" role="group" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            aria-label={`${label}: nota ${n}`}
            aria-pressed={value === n}
            onClick={() => onChange(n)}
            className={cn(
              "h-8 w-8 rounded-md border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              value >= n
                ? "border-accent-deep bg-accent text-ink"
                : "border-line bg-white text-muted hover:bg-surface",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RatingModal({
  open,
  organizationId,
  challengeId,
  opponentName,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  organizationId: string;
  challengeId: string;
  opponentName: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [matchHappened, setMatchHappened] = useState(true);
  const [scores, setScores] = useState<Record<RatingKey, number>>({
    overall: DEFAULT_SCORE,
    punctuality: DEFAULT_SCORE,
    organization_score: DEFAULT_SCORE,
    fair_play: DEFAULT_SCORE,
    communication: DEFAULT_SCORE,
  });
  const [privateComment, setPrivateComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateRatingPayload = {
        match_happened: matchHappened,
        overall: scores.overall,
        punctuality: scores.punctuality,
        organization_score: scores.organization_score,
        fair_play: scores.fair_play,
        communication: scores.communication,
        private_comment: privateComment.trim() || undefined,
      };
      await arenaApi.submitRating(organizationId, challengeId, payload);
      onSubmitted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao enviar avaliação.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rating-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md overflow-y-auto rounded-lg bg-canvas p-5 shadow-lg"
        style={{ maxHeight: "90vh" }}
      >
        <h2 id="rating-title" className="font-display text-lg font-semibold text-ink">
          Avaliar partida com {opponentName}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Sua avaliação ajuda a construir a reputação da comunidade. Comentários são privados e
          vistos apenas pela moderação.
        </p>

        <label className="mt-4 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={matchHappened}
            onChange={(e) => setMatchHappened(e.target.checked)}
            className="mt-1"
          />
          <span>
            <strong className="text-ink">A partida aconteceu conforme combinado?</strong>
            <span className="block text-muted">
              Desmarque se o jogo não ocorreu (no-show, cancelamento de última hora etc.).
            </span>
          </span>
        </label>

        {matchHappened ? (
          <div className="mt-4 space-y-3 rounded-md border border-line bg-surface p-3">
            {RATING_FIELDS.map((field) => (
              <StarRow
                key={field.key}
                label={field.label}
                value={scores[field.key]}
                onChange={(value) => setScores((prev) => ({ ...prev, [field.key]: value }))}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-amber-700">
            Registraremos que a partida não aconteceu. Isso ajuda a manter a comunidade
            confiável.
          </p>
        )}

        <label className="mt-4 block text-sm">
          <span className="mb-1 block text-muted">Comentário privado (opcional)</span>
          <textarea
            maxLength={500}
            value={privateComment}
            onChange={(e) => setPrivateComment(e.target.value)}
            className="w-full rounded-md border border-line bg-white px-3 py-2.5"
            rows={3}
            placeholder="Visível apenas para a moderação, nunca publicado."
          />
        </label>

        {error ? (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex gap-2">
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? "Enviando…" : "Enviar avaliação"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
