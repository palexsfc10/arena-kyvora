import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "../components/layout/AdminShell";
import { Button } from "../components/ui/Button";
import { LoadingState } from "../components/ui/LoadingState";
import { ApiError } from "../lib/api-client";
import { fetchSettings, updateSettings, type PlatformSettings } from "../lib/admin-api";

export function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSettings();
      setSettings(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível carregar as configurações.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggle = async (key: "registrations_open" | "maintenance_mode") => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateSettings({ [key]: !settings[key] });
      setSettings(updated);
      setMessage("Configurações atualizadas com sucesso.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível salvar a alteração.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Configurações" subtitle="Parâmetros gerais da plataforma Arena">
      {loading ? <LoadingState message="Carregando configurações..." /> : null}

      {error ? (
        <div className="admin-card mb-4 border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="admin-card mb-4 border border-emerald-900/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      ) : null}

      {!loading && settings ? (
        <div className="admin-card divide-y divide-slate-800">
          <SettingRow
            title="Inscrições abertas"
            description="Permite que novos times e usuários se cadastrem na Arena."
            checked={settings.registrations_open}
            disabled={saving}
            onToggle={() => void handleToggle("registrations_open")}
          />
          <SettingRow
            title="Modo de manutenção"
            description="Bloqueia o acesso dos usuários enquanto ativo."
            checked={settings.maintenance_mode}
            disabled={saving}
            onToggle={() => void handleToggle("maintenance_mode")}
          />
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-sm font-medium text-slate-100">E-mail de suporte</p>
              <p className="text-xs text-slate-500">
                {settings.support_email ?? "Não configurado"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && !settings && !error ? (
        <div className="admin-card p-6 text-center text-sm text-slate-500">
          Nenhuma configuração disponível.
          <div className="mt-3">
            <Button variant="secondary" onClick={() => void load()}>
              Recarregar
            </Button>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}

function SettingRow({
  title,
  description,
  checked,
  disabled,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div>
        <p className="text-sm font-medium text-slate-100">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
          checked ? "bg-sky-600" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
