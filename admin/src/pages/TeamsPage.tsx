import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AdminShell } from "../components/layout/AdminShell";
import { Badge, type BadgeTone } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { Pagination } from "../components/ui/Pagination";
import { ApiError } from "../lib/api-client";
import { fetchTeams, type Paginated, type TeamSummary } from "../lib/admin-api";

const STATUS_TONE: Record<string, BadgeTone> = {
  active: "success",
  suspended: "danger",
  pending: "warning",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  suspended: "Suspenso",
  pending: "Pendente",
};

export function TeamsPage() {
  const [data, setData] = useState<Paginated<TeamSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTeams({
        page,
        page_size: 20,
        q: search || undefined,
        status: statusFilter || undefined,
      });
      setData(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível carregar os times.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const items = data?.items ?? [];

  return (
    <AdminShell title="Times" subtitle="Gerencie os times cadastrados na Arena">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          className="admin-input max-w-xs"
          placeholder="Buscar por nome ou slug..."
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
        />
        <select
          className="admin-input max-w-[180px]"
          value={statusFilter}
          onChange={(event) => {
            setPage(1);
            setStatusFilter(event.target.value);
          }}
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="suspended">Suspenso</option>
          <option value="pending">Pendente</option>
        </select>
      </div>

      {loading ? <LoadingState message="Carregando times..." /> : null}

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
          title="Nenhum time encontrado"
          description="Ajuste os filtros ou aguarde novos times serem criados."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="admin-card overflow-x-auto p-2">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Capitão</th>
                <th>Membros</th>
                <th>Status</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {items.map((team) => (
                <tr key={team.id}>
                  <td>
                    <Link
                      to={`/teams/${team.id}`}
                      className="font-medium text-sky-400 hover:underline"
                    >
                      {team.name}
                    </Link>
                    <p className="text-xs text-slate-500">{team.slug}</p>
                  </td>
                  <td>{team.captain_name ?? "—"}</td>
                  <td>{team.member_count}</td>
                  <td>
                    <Badge tone={STATUS_TONE[team.status] ?? "neutral"}>
                      {STATUS_LABEL[team.status] ?? team.status}
                    </Badge>
                  </td>
                  <td>{new Date(team.created_at).toLocaleDateString("pt-BR")}</td>
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
