"use client";

import { useCallback, useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";
import type { ChallengeItem } from "@/lib/arena-types";
import { trackEvent } from "@/lib/analytics";

export default function DesafiosPage() {
  const { selectedTeam, session, refreshPending } = useAuth();
  const [items, setItems] = useState<ChallengeItem[]>([]);
  const [direction, setDirection] = useState<"all" | "received" | "sent">("all");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!selectedTeam) return;
    setLoading(true);
    setError(null);
    try {
      const data = await arenaApi.listChallenges(selectedTeam.organization_id, {
        direction: direction === "all" ? undefined : direction,
        status: status || undefined,
      });
      setItems(data.items);
      await refreshPending();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar desafios.");
    } finally {
      setLoading(false);
    }
  }, [selectedTeam, direction, status, refreshPending]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(
    challenge: ChallengeItem,
    action: "accept" | "decline" | "cancel",
  ) {
    if (!selectedTeam) return;
    if (action !== "accept") {
      const ok = window.confirm(
        action === "decline" ? "Recusar este desafio?" : "Cancelar este desafio?",
      );
      if (!ok) return;
    }
    setMessage(null);
    try {
      if (action === "accept") {
        await arenaApi.acceptChallenge(selectedTeam.organization_id, challenge.id);
        trackEvent("arena_challenge_accepted");
      } else if (action === "decline") {
        await arenaApi.declineChallenge(selectedTeam.organization_id, challenge.id);
        trackEvent("arena_challenge_declined");
      } else {
        await arenaApi.cancelChallenge(selectedTeam.organization_id, challenge.id);
      }
      setMessage("Atualizado.");
      await load();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Falha na ação.");
    }
  }

  if (!selectedTeam) {
    return (
      <Container className="py-8">
        <p className="text-sm text-muted">Selecione um time.</p>
      </Container>
    );
  }

  return (
    <Container className="py-6 md:py-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Desafios</h1>
      <p className="mt-1 text-sm text-muted">
        Enviados e recebidos pelo time {selectedTeam.name}.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(
          [
            ["all", "Todos"],
            ["received", "Recebidos"],
            ["sent", "Enviados"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setDirection(value)}
            className={`rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              direction === value ? "bg-surface text-ink" : "text-muted"
            }`}
            aria-pressed={direction === value}
          >
            {label}
          </button>
        ))}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm"
          aria-label="Filtrar por status"
        >
          <option value="">Qualquer status</option>
          <option value="pending">Pendentes</option>
          <option value="accepted">Aceitos</option>
          <option value="declined">Recusados</option>
          <option value="cancelled">Cancelados</option>
          <option value="expired">Expirados</option>
        </select>
      </div>

      {message ? (
        <p className="mt-4 text-sm text-ink-soft" role="status">
          {message}
        </p>
      ) : null}

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted">Carregando…</p>
        ) : error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted">Nenhum desafio neste filtro.</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="border-b border-line pb-4">
                <p className="text-sm font-semibold text-ink">
                  {item.direction === "sent"
                    ? `Para ${item.recipient_organization_name}`
                    : `De ${item.sender_organization_name}`}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {item.proposed_date}
                  {item.proposed_time ? ` · ${item.proposed_time}` : ""} ·{" "}
                  {item.status}
                </p>
                {item.message ? (
                  <p className="mt-2 text-sm text-ink-soft">{item.message}</p>
                ) : null}
                {item.status === "pending" && session?.can_manage_selected ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.direction === "received" ? (
                      <>
                        <Button type="button" onClick={() => void act(item, "accept")}>
                          Aceitar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void act(item, "decline")}
                        >
                          Recusar
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void act(item, "cancel")}
                      >
                        Cancelar envio
                      </Button>
                    )}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
