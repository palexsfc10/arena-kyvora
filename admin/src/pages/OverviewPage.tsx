import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AdminShell } from "../components/layout/AdminShell";
import { LoadingState } from "../components/ui/LoadingState";
import { ApiError } from "../lib/api-client";
import { fetchOverview, type OverviewStats } from "../lib/admin-api";

export function OverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOverview();
      setStats(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar a visão geral.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell title="Visão geral" subtitle="Indicadores gerais da plataforma Arena">
      {loading ? <LoadingState message="Carregando indicadores..." /> : null}

      {error ? (
        <div className="admin-card mb-4 border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => void load()}
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {!loading && !error && stats ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Times" value={stats.teams_total} to="/teams" />
          <StatCard label="Times ativos" value={stats.teams_active} to="/teams" />
          <StatCard label="Usuários" value={stats.users_total} to="/users" />
          <StatCard label="Desafios ativos" value={stats.challenges_active} to="/challenges" />
          <StatCard
            label="Moderação pendente"
            value={stats.moderation_pending}
            to="/moderation"
            highlight={stats.moderation_pending > 0}
          />
          <StatCard
            label="Avisos publicados"
            value={stats.announcements_published}
            to="/announcements"
          />
        </section>
      ) : null}

      {!loading && !error && !stats ? (
        <p className="text-sm text-slate-500">Nenhum indicador disponível.</p>
      ) : null}
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  to,
  highlight = false,
}: {
  label: string;
  value: number;
  to: string;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`admin-card block p-4 transition-shadow hover:shadow-md ${
        highlight ? "border-amber-500/60 bg-amber-950/20" : ""
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-100">{value}</p>
    </Link>
  );
}
