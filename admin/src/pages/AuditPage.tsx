import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "../components/layout/AdminShell";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { Pagination } from "../components/ui/Pagination";
import { ApiError } from "../lib/api-client";
import { fetchAuditLogs, type AuditLogEntry, type Paginated } from "../lib/admin-api";

export function AuditPage() {
  const [data, setData] = useState<Paginated<AuditLogEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAuditLogs({
        page,
        page_size: 20,
        action: actionFilter || undefined,
      });
      setData(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível carregar a auditoria.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const items = data?.items ?? [];

  return (
    <AdminShell title="Auditoria" subtitle="Histórico de ações realizadas no painel">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          className="admin-input max-w-xs"
          placeholder="Filtrar por ação..."
          value={actionFilter}
          onChange={(event) => {
            setPage(1);
            setActionFilter(event.target.value);
          }}
        />
      </div>

      {loading ? <LoadingState message="Carregando logs..." /> : null}

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
          title="Nenhum registro de auditoria"
          description="As ações administrativas realizadas aparecerão aqui."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="admin-card overflow-x-auto p-2">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Ação</th>
                <th>Autor</th>
                <th>Entidade</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.created_at).toLocaleString("pt-BR")}</td>
                  <td className="font-medium text-slate-100">{entry.action}</td>
                  <td>{entry.actor_email ?? "—"}</td>
                  <td>
                    {entry.entity_type ? `${entry.entity_type} · ${entry.entity_id ?? ""}` : "—"}
                  </td>
                  <td className="max-w-xs truncate">{entry.reason ?? "—"}</td>
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
