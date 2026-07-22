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

/** Keep in sync with backend CreateFeedbackRequest (schemas/arena.py). */
const MIN_SUBJECT = 3;
const MAX_SUBJECT = 200;
const MIN_BODY = 10;
const MAX_BODY = 4000;

export default function FeedbackPage() {
  const { selectedTeam } = useAuth();
  const [feedbackType, setFeedbackType] = useState<ArenaFeedbackType>("suggestion");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    subject?: string;
    body?: string;
  }>({});

  const inFlightRef = useRef(false);

  function validateClient(): boolean {
    const next: { subject?: string; body?: string } = {};
    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();
    if (trimmedSubject.length < MIN_SUBJECT) {
      next.subject = `O assunto precisa ter pelo menos ${MIN_SUBJECT} caracteres.`;
    }
    if (trimmedBody.length < MIN_BODY) {
      next.body = `A mensagem precisa ter pelo menos ${MIN_BODY} caracteres.`;
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (inFlightRef.current || submitting) return;
    setError(null);
    setSuccess(false);
    if (!validateClient()) return;

    inFlightRef.current = true;
    setSubmitting(true);
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
      setFieldErrors({});
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

      <form onSubmit={onSubmit} className="mt-6 max-w-lg space-y-4" noValidate>
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
            minLength={MIN_SUBJECT}
            maxLength={MAX_SUBJECT}
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (fieldErrors.subject) {
                setFieldErrors((prev) => ({ ...prev, subject: undefined }));
              }
            }}
            className="w-full rounded-md border border-line bg-white px-3 py-2.5"
            placeholder="Resuma em poucas palavras"
            aria-invalid={Boolean(fieldErrors.subject)}
            aria-describedby={fieldErrors.subject ? "feedback-subject-error" : "feedback-subject-hint"}
          />
          <p id="feedback-subject-hint" className="mt-1 text-xs text-muted">
            Mínimo de {MIN_SUBJECT} caracteres.
          </p>
          {fieldErrors.subject ? (
            <p id="feedback-subject-error" className="mt-1 text-sm text-red-700" role="alert">
              {fieldErrors.subject}
            </p>
          ) : null}
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-muted">Mensagem</span>
          <textarea
            required
            minLength={MIN_BODY}
            maxLength={MAX_BODY}
            rows={6}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (fieldErrors.body) {
                setFieldErrors((prev) => ({ ...prev, body: undefined }));
              }
            }}
            className="w-full rounded-md border border-line bg-white px-3 py-2.5"
            placeholder="Descreva com o máximo de detalhes possível"
            aria-invalid={Boolean(fieldErrors.body)}
            aria-describedby={fieldErrors.body ? "feedback-body-error" : "feedback-body-hint"}
          />
          <p id="feedback-body-hint" className="mt-1 text-xs text-muted">
            Mínimo de {MIN_BODY} caracteres ({body.trim().length}/{MIN_BODY}).
          </p>
          {fieldErrors.body ? (
            <p id="feedback-body-error" className="mt-1 text-sm text-red-700" role="alert">
              {fieldErrors.body}
            </p>
          ) : null}
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
