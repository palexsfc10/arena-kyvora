"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";
import type { AvailabilityItem } from "@/lib/arena-types";
import { trackEvent } from "@/lib/analytics";
import { getCityHints } from "@/lib/locationHints";

export default function DisponibilidadesPage() {
  const { selectedTeam, session } = useAuth();
  const [items, setItems] = useState<AvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [modality, setModality] = useState("futsal");
  const [city, setCity] = useState(selectedTeam?.city ?? "");
  const [region, setRegion] = useState(selectedTeam?.state ?? "");
  const [availableFrom, setAvailableFrom] = useState("");
  const [period, setPeriod] = useState("flexible");
  const [venue, setVenue] = useState("to_arrange");
  const [notes, setNotes] = useState("");

  const locationHints = getCityHints(city, region);

  const load = useCallback(async () => {
    if (!selectedTeam) return;
    setLoading(true);
    setError(null);
    try {
      const data = await arenaApi.listMyAvailabilities(selectedTeam.organization_id);
      setItems(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao listar.");
    } finally {
      setLoading(false);
    }
  }, [selectedTeam]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selectedTeam?.city) setCity(selectedTeam.city);
    if (selectedTeam?.state) setRegion(selectedTeam.state);
  }, [selectedTeam]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!selectedTeam || !session?.can_manage_selected) return;
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    trackEvent("arena_availability_started");
    try {
      await arenaApi.createAvailability(selectedTeam.organization_id, {
        modality,
        city,
        region: region || undefined,
        available_from: availableFrom,
        preferred_period: period,
        venue_option: venue,
        notes: notes || undefined,
        idempotency_key: `ui-avail-${Date.now()}`,
      });
      trackEvent("arena_availability_created");
      setSuccess("Disponibilidade publicada.");
      setNotes("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao publicar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onCancel(id: string) {
    if (!selectedTeam) return;
    if (!window.confirm("Cancelar esta disponibilidade?")) return;
    try {
      await arenaApi.cancelAvailability(selectedTeam.organization_id, id);
      setSuccess("Disponibilidade cancelada.");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao cancelar.");
    }
  }

  if (!selectedTeam) {
    return (
      <Container className="py-8">
        <p className="text-sm text-muted">Selecione um time para continuar.</p>
      </Container>
    );
  }

  return (
    <Container className="py-6 md:py-8">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Minhas disponibilidades
      </h1>
      <p className="mt-1 text-sm text-muted">
        Publique quando seu time está livre para jogar.
      </p>

      {session?.can_manage_selected ? (
        <form
          onSubmit={onCreate}
          className="mt-6 grid gap-3 border-b border-line pb-8 sm:grid-cols-2"
        >
          <h2 className="font-display text-lg font-semibold sm:col-span-2">
            Disponibilizar meu time
          </h2>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Modalidade</span>
            <select
              required
              value={modality}
              onChange={(e) => setModality(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5"
            >
              <option value="futsal">Futsal</option>
              <option value="futebol">Futebol</option>
              <option value="society">Society</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Data</span>
            <input
              type="date"
              required
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Cidade</span>
            <input
              required
              minLength={2}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Região / UF</span>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5"
              maxLength={2}
              placeholder="Ex.: SP"
            />
          </label>
          {locationHints.length > 0 ? (
            <div className="sm:col-span-2">
              {locationHints.map((hint) => (
                <p key={hint} className="text-xs text-amber-700">
                  {hint}
                </p>
              ))}
            </div>
          ) : null}
          <label className="text-sm">
            <span className="mb-1 block text-muted">Período</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5"
            >
              <option value="flexible">Flexível</option>
              <option value="morning">Manhã</option>
              <option value="afternoon">Tarde</option>
              <option value="evening">Noite</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Local</span>
            <select
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5"
            >
              <option value="to_arrange">A combinar</option>
              <option value="yes">Temos local</option>
              <option value="no">Sem local</option>
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-muted">Observações</span>
            <textarea
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5"
              rows={3}
            />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Publicando…" : "Publicar disponibilidade"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-6 text-sm text-muted">
          Você pode consultar, mas só gestores/técnicos publicam pelo time.
        </p>
      )}

      {success ? (
        <p className="mt-4 text-sm text-ink-soft" role="status">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold">Publicações</h2>
        {loading ? (
          <p className="mt-3 text-sm text-muted">Carregando…</p>
        ) : items.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nenhuma publicação ainda.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {items.map((item) => (
              <li key={item.id} className="border-b border-line py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {item.available_from} · {item.modality} · {item.status}
                    </p>
                    <p className="text-sm text-muted">
                      {item.city}
                      {item.region ? ` / ${item.region}` : ""}
                    </p>
                  </div>
                  {session?.can_manage_selected && item.status === "active" ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void onCancel(item.id)}
                    >
                      Cancelar
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
