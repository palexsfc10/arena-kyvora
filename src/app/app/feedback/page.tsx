"use client";

import { FormEvent, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";
import type { ArenaFeedbackType } from "@/lib/arena-types";
import { trackEvent } from "@/lib/analytics";

const TYPE_OPTIONS: Array<{ value: ArenaFeedbackType; label: string }> = [
  { value: "suggestion", label: "Sugestão" },
  { value: "improvement", label: "Melhoria" },
  { value: "problem", label: "Problema" },
  { value: "compliment", label: "Elogio" },
];

export default function FeedbackPage() {
  const { selectedTeam } = useAuth();
  const [feedbackType, setFeedbackType] = useState<ArenaFeedbackType>("suggestion");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guards against double-submit from rapid double clicks / double taps,
  // in addition to the disabled button state below.
  const inFlightRef = useRef(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (inFlightRef.current || submitting) return;
    if (!subject.trim() || !body.trim()) {
      setError("Preencha o assunto e a mensagem.");
      return;
    }
    inFlightRef.current = true;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    trackEvent("arena_feedback_started");
    try {
      await arenaApi.submitFeedback({
        feedback_type: feedbackType,
        subject: subject.trim(),
        body: body.trim(),
        organization_id: selectedTeam?.organization_id,
      });
      trackEvent("arena_feedback_sent");
      setSuccess(true);
      setSubject("");
      setBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao enviar sua mensagem.");
    } finally {
      setSubmitting(false);
      inFlightRef.current = false;
    }
  }

  return (
    <Container className="py-6 md:py-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Enviar sugestão</h1>
      <p className="mt-1 max-w-lg text-sm text-muted">
        Conte o que está funcionando bem, o que pode melhorar, ou relate um problema. Sua
        mensagem vai direto para o time do Arena.
      </p>

      <form onSubmit={onSubmit} className="mt-6 max-w-lg space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Tipo</span>
          <select
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value as ArenaFeedbackType)}
            className="w-full rounded-md border border-line bg-white px-3 py-2.5"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-muted">Assunto</span>
          <input
            required
            maxLength={140}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-md border border-line bg-white px-3 py-2.5"
            placeholder="Resuma em poucas palavras"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-muted">Mensagem</span>
          <textarea
            required
            maxLength={2000}
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-md border border-line bg-white px-3 py-2.5"
            placeholder="Descreva com o máximo de detalhes possível"
          />
        </label>

        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="text-sm text-ink-soft" role="status">
            Mensagem enviada. Obrigado por ajudar a melhorar o Arena!
          </p>
        ) : null}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Enviando…" : "Enviar"}
        </Button>
      </form>
    </Container>
  );
}
