import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "../components/layout/AdminShell";
import { Badge, type BadgeTone } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { Pagination } from "../components/ui/Pagination";
import { ApiError } from "../lib/api-client";
import { fetchChallenges, type ChallengeSummary, type Paginated } from "../lib/admin-api";

const STATUS_TONE: Record<string, BadgeTone> = {
  active: "success",
  scheduled: "info",
  finished: "neutral",
  cancelled: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  scheduled: "Agendado",
  finished: "Finalizado",
  cancelled: "Cancelado",
};

export function ChallengesPage() {
  const [data, setData] = useState<Paginated<ChallengeSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchChallenges({
        page,
        page_size: 20,
        status: statusFilter || undefined,
      });
      setData(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível carregar os desafios.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const items = data?.items ?? [];

  return (
    <AdminShell title="Desafios" subtitle="Acompanhe os desafios criados na Arena">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          className="admin-input max-w-[200px]"
          value={statusFilter}
          onChange={(event) => {
            setPage(1);
            setStatusFilter(event.target.value);
          }}
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="scheduled">Agendado</option>
          <option value="finished">Finalizado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {loading ? <LoadingState message="Carregando desafios..." /> : null}

      {error ? (
        <div className="admin-card mb-4 border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
          <button type="button" className="ml-3 underline" onClick={() => void load()}>
            Tentar novamente
          </button>
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="Nenhum desafio encontrado"
          description="Novos desafios aparecerão aqui quando forem criados."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="admin-card overflow-x-auto p-2">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Participantes</th>
                <th>Início</th>
                <th>Fim</th>
              </tr>
            </thead>
            <tbody>
              {items.map((challenge) => (
                <tr key={challenge.id}>
                  <td className="font-medium text-slate-100">{challenge.title}</td>
                  <td>{challenge.category ?? "—"}</td>
                  <td>
                    <Badge tone={STATUS_TONE[challenge.status] ?? "neutral"}>
                      {STATUS_LABEL[challenge.status] ?? challenge.status}
                    </Badge>
                  </td>
                  <td>{challenge.participant_count}</td>
                  <td>
                    {challenge.starts_at
                      ? new Date(challenge.starts_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td>
                    {challenge.ends_at
                      ? new Date(challenge.ends_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data ? (
            <div className="px-2 pt-2">
              <Pagination pagination={data.pagination} onPageChange={setPage} />
            </div>
          ) : null}
        </div>
      ) : null}
    </AdminShell>
  );
}
