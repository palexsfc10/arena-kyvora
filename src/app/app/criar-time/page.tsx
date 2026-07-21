"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";
import { trackEvent } from "@/lib/analytics";

export default function CriarTimePage() {
  const { refreshSession } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [modality, setModality] = useState("futsal");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [participate, setParticipate] = useState(true);
  const [discoverable, setDiscoverable] = useState(true);
  const [publicCity, setPublicCity] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    trackEvent("arena_team_create_started");
    try {
      await arenaApi.createTeam({
        name: name.trim(),
        modality,
        city: city.trim(),
        state: state.trim() || undefined,
        public_description: description.trim() || undefined,
        participate_in_arena: participate,
        discoverable: participate ? discoverable : false,
        public_city: publicCity,
        idempotency_key: `ui-team-${Date.now()}`,
      });
      trackEvent("arena_team_create_completed");
      await refreshSession();
      if (participate) {
        router.replace("/app/explorar");
      } else {
        router.replace("/app/ativar-participacao");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar o time.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container className="py-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Criar meu time</h1>
      <p className="mt-2 max-w-lg text-sm text-muted">
        Cadastre o time que você representa no Arena. Você controla o que fica público.
      </p>
      <form onSubmit={onSubmit} className="mt-8 grid max-w-lg gap-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Nome do time</span>
          <input
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-line bg-white px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Modalidade</span>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="w-full rounded-md border border-line bg-white px-3 py-2.5"
          >
            <option value="futsal">Futsal</option>
            <option value="futebol">Futebol</option>
            <option value="society">Society</option>
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Cidade</span>
            <input
              required
              minLength={2}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">UF / região</span>
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5"
              placeholder="Ex.: SP"
            />
          </label>
        </div>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Descrição curta (opcional)</span>
          <textarea
            maxLength={280}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-line bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={participate}
            onChange={(e) => setParticipate(e.target.checked)}
            className="mt-1"
          />
          <span>
            <strong>Participar do Arena</strong>
            <span className="block text-muted">
              Nome, modalidade e cidade aproximada podem aparecer para outros times.
              Contatos e elenco não são publicados automaticamente.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={discoverable}
            disabled={!participate}
            onChange={(e) => setDiscoverable(e.target.checked)}
            className="mt-1"
          />
          <span>Permitir que minhas disponibilidades apareçam no Explorar</span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={publicCity}
            onChange={(e) => setPublicCity(e.target.checked)}
            className="mt-1"
          />
          <span>Exibir cidade aproximada</span>
        </label>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Criando…" : "Criar time e continuar"}
        </Button>
      </form>
    </Container>
  );
}
