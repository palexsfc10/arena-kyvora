"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function SelecionarTimePage() {
  const { session, selectTeam, selectedTeam } = useAuth();

  if (!session) return null;

  return (
    <Container className="py-8">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Qual time você representa?
      </h1>
      <p className="mt-2 text-sm text-muted">
        No Arena você age em nome de um time vinculado à sua conta Kyvora.
      </p>
      <ul className="mt-8 space-y-3">
        {session.teams.map((team) => (
          <li key={team.organization_id}>
            <button
              type="button"
              onClick={() => void selectTeam(team.organization_id)}
              className="flex w-full items-center justify-between rounded-md border border-line bg-white px-4 py-3 text-left hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span>
                <span className="block font-semibold text-ink">{team.name}</span>
                <span className="text-sm text-muted">
                  {[team.modality, team.city].filter(Boolean).join(" · ")} ·{" "}
                  {team.role}
                </span>
              </span>
              {selectedTeam?.organization_id === team.organization_id ? (
                <span className="text-xs font-medium text-accent-deep">Atual</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      {selectedTeam ? (
        <div className="mt-6">
          <Button href="/app/explorar" variant="outline">
            Continuar com {selectedTeam.name}
          </Button>
        </div>
      ) : null}
    </Container>
  );
}
