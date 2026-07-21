"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";
import type { TeamSettings } from "@/lib/arena-types";

export default function MeuTimePage() {
  const { selectedTeam, session } = useAuth();
  const [settings, setSettings] = useState<TeamSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!selectedTeam) return;
    setLoading(true);
    try {
      const data = await arenaApi.getTeamSettings(selectedTeam.organization_id);
      setSettings(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }, [selectedTeam]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (!selectedTeam || !settings || !session?.can_manage_selected) return;
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    try {
      const updated = await arenaApi.updateTeamSettings(selectedTeam.organization_id, {
        arena_enabled: settings.arena_enabled,
        discoverable: settings.discoverable,
        public_city: settings.public_city,
        public_description: settings.public_description,
      });
      setSettings(updated);
      setSuccess("Preferências salvas.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao salvar.");
    } finally {
      setSubmitting(false);
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
      <h1 className="font-display text-2xl font-semibold text-ink">Meu time</h1>
      <p className="mt-1 text-sm text-muted">
        Como seu time aparece no Arena.
      </p>

      {loading || !settings ? (
        <p className="mt-6 text-sm text-muted">Carregando…</p>
      ) : (
        <>
          <div className="mt-6 space-y-1">
            <p className="font-display text-xl font-semibold">{settings.name}</p>
            <p className="text-sm text-muted">
              {[settings.modality, settings.city, settings.state]
                .filter(Boolean)
                .join(" · ") || "Sem localização pública"}
            </p>
          </div>

          <form onSubmit={onSave} className="mt-8 max-w-lg space-y-4">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={settings.arena_enabled}
                disabled={!session?.can_manage_selected}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    arena_enabled: e.target.checked,
                    discoverable: e.target.checked ? settings.discoverable : false,
                  })
                }
                className="mt-1"
              />
              <span>
                <strong className="text-ink">Participar do Arena</strong>
                <span className="block text-muted">
                  Opt-in para aparecer e publicar no produto.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={settings.discoverable}
                disabled={!session?.can_manage_selected || !settings.arena_enabled}
                onChange={(e) =>
                  setSettings({ ...settings, discoverable: e.target.checked })
                }
                className="mt-1"
              />
              <span>
                <strong className="text-ink">Perfil localizável</strong>
                <span className="block text-muted">
                  Permite que disponibilidades entrem no Explorar.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={settings.public_city}
                disabled={!session?.can_manage_selected}
                onChange={(e) =>
                  setSettings({ ...settings, public_city: e.target.checked })
                }
                className="mt-1"
              />
              <span>
                <strong className="text-ink">Exibir cidade</strong>
              </span>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Descrição pública</span>
              <textarea
                maxLength={280}
                disabled={!session?.can_manage_selected}
                value={settings.public_description ?? ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    public_description: e.target.value,
                  })
                }
                className="w-full rounded-md border border-line bg-white px-3 py-2.5"
                rows={3}
              />
            </label>
            <p className="text-xs text-muted">
              Elenco e estatísticas públicas permanecem desabilitados neste MVP.
            </p>
            {session?.can_manage_selected ? (
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando…" : "Salvar preferências"}
              </Button>
            ) : (
              <p className="text-sm text-muted">Somente gestores podem alterar.</p>
            )}
          </form>

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
        </>
      )}
    </Container>
  );
}
