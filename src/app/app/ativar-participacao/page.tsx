"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";

export default function AtivarParticipacaoPage() {
  const { selectedTeam, session, refreshSession } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function activate() {
    if (!selectedTeam || !session?.can_manage_selected) return;
    setSubmitting(true);
    setError(null);
    try {
      await arenaApi.updateTeamSettings(selectedTeam.organization_id, {
        arena_enabled: true,
        discoverable: true,
        public_city: true,
      });
      await refreshSession();
      router.replace("/app/explorar");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível ativar.");
    } finally {
      setSubmitting(false);
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
    <Container className="py-8">
      <h1 className="font-display text-2xl font-semibold">Ativar participação</h1>
      <p className="mt-3 max-w-lg text-sm text-muted">
        O time <strong className="text-ink">{selectedTeam.name}</strong> ainda não
        participa do Arena. Ao ativar, outros times poderão ver nome, modalidade e
        cidade aproximada nas disponibilidades. Você pode desativar depois.
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
        <li>Não publicamos telefone, e-mail ou endereço exato</li>
        <li>Elenco e estatísticas permanecem privados neste momento</li>
        <li>Somente gestores do time podem alterar essa opção</li>
      </ul>
      {error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        {session?.can_manage_selected ? (
          <Button type="button" disabled={submitting} onClick={() => void activate()}>
            {submitting ? "Ativando…" : "Ativar e explorar jogos"}
          </Button>
        ) : (
          <p className="text-sm text-muted">
            Peça a um gestor do time para ativar a participação.
          </p>
        )}
        <Button href="/app/explorar" variant="outline">
          Continuar sem ativar
        </Button>
      </div>
    </Container>
  );
}
