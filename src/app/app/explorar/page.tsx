"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { TeamShield } from "@/components/app/TeamShield";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";
import type { AvailabilityItem, NextMatchItem } from "@/lib/arena-types";
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

function friendlyError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.errorCode === "SCHEDULE_CONFLICT") {
      return "Já existe um compromisso confirmado nesse horário. Escolha outro horário.";
    }
    return err.message;
  }
  return fallback;
}

export default function ExplorarPage() {
  const { selectedTeam, session } = useAuth();
  const [items, setItems] = useState<AvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modality, setModality] = useState("");
  const [city, setCity] = useState("");
  const [availableOn, setAvailableOn] = useState("");
  const [period, setPeriod] = useState("");

  const [nextMatch, setNextMatch] = useState<NextMatchItem | null>(null);
  const [nextMatchLoading, setNextMatchLoading] = useState(true);

  const [challengeFor, setChallengeFor] = useState<AvailabilityItem | null>(null);
  const [challengeDate, setChallengeDate] = useState("");
  const [challengeTime, setChallengeTime] = useState("");
  const [challengePhone, setChallengePhone] = useState("");
  const [challengeVenue, setChallengeVenue] = useState("to_arrange");
  const [challengeMessage, setChallengeMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      trackEvent("explore_viewed");
      const data = await arenaApi.exploreAvailabilities({
        modality: modality || undefined,
        city: city || undefined,
        available_on: availableOn || undefined,
        preferred_period: period || undefined,
      });
      setItems(data?.items ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar oportunidades.");
    } finally {
      setLoading(false);
    }
  }, [modality, city, availableOn, period]);

  const loadNextMatch = useCallback(async () => {
    if (!selectedTeam) {
      setNextMatchLoading(false);
      return;
    }
    setNextMatchLoading(true);
    try {
      const data = await arenaApi.getNextMatch(selectedTeam.organization_id);
      setNextMatch(data);
    } catch {
      setNextMatch(null);
    } finally {
      setNextMatchLoading(false);
    }
  }, [selectedTeam]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadNextMatch();
  }, [loadNextMatch]);

  function clearFilters() {
    setModality("");
    setCity("");
    setAvailableOn("");
    setPeriod("");
  }

  function openChallengeModal(item: AvailabilityItem) {
    setChallengeFor(item);
    setChallengeDate(item.available_from);
    setChallengeTime("");
    setChallengePhone("");
    setChallengeVenue(item.venue_option || "to_arrange");
    setChallengeMessage("");
    setFormError(null);
  }

  async function sendChallenge(event: FormEvent) {
    event.preventDefault();
    if (!selectedTeam || !challengeFor || !session?.can_manage_selected) return;
    if (!challengeDate || !challengeTime) {
      setFormError("Informe data e horário propostos.");
      return;
    }
    if (!challengePhone.trim()) {
      setFormError("Informe um telefone de contato para o desafio.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    setActionMsg(null);
    trackEvent("challenge_started");
    try {
      await arenaApi.createChallenge(selectedTeam.organization_id, {
        availability_id: challengeFor.id,
        proposed_date: challengeDate,
        proposed_time: challengeTime,
        contact_phone: challengePhone.trim(),
        venue_option: challengeVenue,
        message: challengeMessage || undefined,
        idempotency_key: `ui-${challengeFor.id}-${Date.now()}`,
      });
      trackEvent("challenge_created");
      setActionMsg("Desafio enviado.");
      setChallengeFor(null);
      setChallengeMessage("");
      setChallengePhone("");
    } catch (err) {
      setActionMsg(friendlyError(err, "Falha ao enviar desafio."));
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
      <p className="mt-2 text-xs text-muted">
        Arena Kyvora — gratuito para encontrar times e marcar jogos.
      </p>

      {!nextMatchLoading && nextMatch ? (
        <div className="mt-6 rounded-lg border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Próxima partida confirmada
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <TeamShield
              logoUrl={nextMatch.opponent_logo_url}
              name={nextMatch.opponent_organization_name}
              size="md"
            />
            <div className="min-w-0">
              <p
                className="truncate font-display text-lg font-semibold text-ink"
                title={nextMatch.opponent_organization_name}
              >
                vs. {nextMatch.opponent_organization_name}
              </p>
              <p className="text-sm text-ink-soft">
                {nextMatch.proposed_date}
                {nextMatch.proposed_time ? ` · ${nextMatch.proposed_time}` : ""} ·{" "}
                {venueLabel[nextMatch.venue_option] ?? nextMatch.venue_option}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <form
        className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          trackEvent("explore_filter_changed");
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
                  <div className="flex min-w-0 items-start gap-2.5">
                    <TeamShield logoUrl={item.logo_url} name={item.organization_name} />
                    <div className="min-w-0">
                      <h2
                        className="truncate font-display text-lg font-semibold text-ink"
                        title={item.organization_name}
                      >
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
                  </div>
                  {session?.can_manage_selected ? (
                    <Button
                      type="button"
                      size="md"
                      onClick={() => openChallengeModal(item)}
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
            className="w-full max-w-md overflow-y-auto rounded-lg bg-canvas p-5 shadow-lg"
            style={{ maxHeight: "90vh" }}
          >
            <h2 id="challenge-title" className="font-display text-lg font-semibold">
              Desafiar {challengeFor.organization_name}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block text-muted">Data proposta</span>
                <input
                  type="date"
                  required
                  value={challengeDate}
                  onChange={(e) => setChallengeDate(e.target.value)}
                  className="w-full rounded-md border border-line bg-white px-3 py-2.5"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-muted">Horário proposto</span>
                <input
                  type="time"
                  required
                  value={challengeTime}
                  onChange={(e) => setChallengeTime(e.target.value)}
                  className="w-full rounded-md border border-line bg-white px-3 py-2.5"
                />
              </label>
            </div>
            <label className="mt-3 block text-sm">
              <span className="mb-1 block text-muted">Telefone de contato</span>
              <input
                type="tel"
                required
                minLength={8}
                maxLength={32}
                placeholder="Ex.: (11) 98888-7777"
                value={challengePhone}
                onChange={(e) => setChallengePhone(e.target.value)}
                className="w-full rounded-md border border-line bg-white px-3 py-2.5"
              />
              <span className="mt-1 block text-xs text-muted">
                Visível apenas para o time desafiado, para combinar os detalhes.
              </span>
            </label>
            <label className="mt-3 block text-sm">
              <span className="mb-1 block text-muted">Local</span>
              <select
                value={challengeVenue}
                onChange={(e) => setChallengeVenue(e.target.value)}
                className="w-full rounded-md border border-line bg-white px-3 py-2.5"
              >
                <option value="to_arrange">A combinar</option>
                <option value="yes">Local disponível</option>
                <option value="no">Sem local</option>
              </select>
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
            {formError ? (
              <p className="mt-3 text-sm text-red-700" role="alert">
                {formError}
              </p>
            ) : null}
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
