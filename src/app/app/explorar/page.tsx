"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";
import type { AvailabilityItem } from "@/lib/arena-types";
import { trackEvent } from "@/lib/analytics";

const periodLabel: Record<string, string> = {
  morning: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
  flexible: "Flexível",
};

const venueLabel: Record<string, string> = {
  yes: "Local disponível",
  no: "Sem local",
  to_arrange: "A combinar",
};

export default function ExplorarPage() {
  const { selectedTeam, session } = useAuth();
  const [items, setItems] = useState<AvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modality, setModality] = useState("");
  const [city, setCity] = useState("");
  const [availableOn, setAvailableOn] = useState("");
  const [period, setPeriod] = useState("");
  const [challengeFor, setChallengeFor] = useState<AvailabilityItem | null>(null);
  const [challengeDate, setChallengeDate] = useState("");
  const [challengeMessage, setChallengeMessage] = useState("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      trackEvent("arena_explore_viewed");
      const data = await arenaApi.exploreAvailabilities({
        modality: modality || undefined,
        city: city || undefined,
        available_on: availableOn || undefined,
        preferred_period: period || undefined,
      });
      setItems(data.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar oportunidades.");
    } finally {
      setLoading(false);
    }
  }, [modality, city, availableOn, period]);

  useEffect(() => {
    void load();
  }, [load]);

  function clearFilters() {
    setModality("");
    setCity("");
    setAvailableOn("");
    setPeriod("");
  }

  async function sendChallenge(event: FormEvent) {
    event.preventDefault();
    if (!selectedTeam || !challengeFor || !session?.can_manage_selected) return;
    setSubmitting(true);
    setActionMsg(null);
    trackEvent("arena_challenge_started");
    try {
      await arenaApi.createChallenge(selectedTeam.organization_id, {
        availability_id: challengeFor.id,
        proposed_date: challengeDate || challengeFor.available_from,
        venue_option: "to_arrange",
        message: challengeMessage || undefined,
        idempotency_key: `ui-${challengeFor.id}-${Date.now()}`,
      });
      trackEvent("arena_challenge_sent");
      setActionMsg("Desafio enviado.");
      setChallengeFor(null);
      setChallengeMessage("");
    } catch (err) {
      setActionMsg(err instanceof ApiError ? err.message : "Falha ao enviar desafio.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container className="py-6 md:py-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Explorar jogos</h1>
      <p className="mt-1 text-sm text-muted">
        Disponibilidades públicas de outros times prontos para jogar.
      </p>

      <form
        className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          trackEvent("arena_filter_applied");
          void load();
        }}
      >
        <label className="text-sm">
          <span className="mb-1 block text-muted">Modalidade</span>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="w-full rounded-md border border-line bg-white px-3 py-2.5"
          >
            <option value="">Todas</option>
            <option value="futsal">Futsal</option>
            <option value="futebol">Futebol</option>
            <option value="society">Society</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Cidade</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-md border border-line bg-white px-3 py-2.5"
            placeholder="Ex.: São Paulo"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Data</span>
          <input
            type="date"
            value={availableOn}
            onChange={(e) => setAvailableOn(e.target.value)}
            className="w-full rounded-md border border-line bg-white px-3 py-2.5"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Período</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full rounded-md border border-line bg-white px-3 py-2.5"
          >
            <option value="">Qualquer</option>
            <option value="morning">Manhã</option>
            <option value="afternoon">Tarde</option>
            <option value="evening">Noite</option>
            <option value="flexible">Flexível</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <Button type="submit" className="flex-1">
            Filtrar
          </Button>
          <Button type="button" variant="outline" onClick={clearFilters}>
            Limpar
          </Button>
        </div>
      </form>

      {actionMsg ? (
        <p className="mt-4 text-sm text-ink-soft" role="status">
          {actionMsg}
        </p>
      ) : null}

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted" role="status">
            Carregando oportunidades…
          </p>
        ) : error ? (
          <div className="space-y-2">
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
            <Button type="button" variant="outline" onClick={() => void load()}>
              Tentar novamente
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted">
            Nenhuma disponibilidade encontrada com esses filtros.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="border-b border-line py-4 last:border-b-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink">
                      {item.organization_name}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {item.modality}
                      {item.city ? ` · ${item.city}` : ""}
                      {item.region ? `/${item.region}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {item.available_from}
                      {item.available_until ? ` → ${item.available_until}` : ""}
                      {" · "}
                      {periodLabel[item.preferred_period] ?? item.preferred_period}
                      {" · "}
                      {venueLabel[item.venue_option] ?? item.venue_option}
                    </p>
                    {item.notes ? (
                      <p className="mt-2 text-sm text-muted">{item.notes}</p>
                    ) : null}
                  </div>
                  {session?.can_manage_selected ? (
                    <Button
                      type="button"
                      size="md"
                      onClick={() => {
                        setChallengeFor(item);
                        setChallengeDate(item.available_from);
                      }}
                    >
                      Desafiar
                    </Button>
                  ) : (
                    <p className="text-xs text-muted">Somente gestores podem desafiar</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {challengeFor ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="challenge-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setChallengeFor(null);
          }}
        >
          <form
            onSubmit={sendChallenge}
            className="w-full max-w-md rounded-lg bg-canvas p-5 shadow-lg"
          >
            <h2 id="challenge-title" className="font-display text-lg font-semibold">
              Desafiar {challengeFor.organization_name}
            </h2>
            <label className="mt-4 block text-sm">
              <span className="mb-1 block text-muted">Data proposta</span>
              <input
                type="date"
                required
                value={challengeDate}
                onChange={(e) => setChallengeDate(e.target.value)}
                className="w-full rounded-md border border-line bg-white px-3 py-2.5"
              />
            </label>
            <label className="mt-3 block text-sm">
              <span className="mb-1 block text-muted">Mensagem (opcional)</span>
              <textarea
                maxLength={500}
                value={challengeMessage}
                onChange={(e) => setChallengeMessage(e.target.value)}
                className="w-full rounded-md border border-line bg-white px-3 py-2.5"
                rows={3}
              />
            </label>
            <div className="mt-5 flex gap-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? "Enviando…" : "Enviar desafio"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setChallengeFor(null)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </Container>
  );
}
