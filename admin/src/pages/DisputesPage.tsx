import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "../components/layout/AdminShell";
import { Badge, type BadgeTone } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { Pagination } from "../components/ui/Pagination";
import { ReasonModal } from "../components/ui/ReasonModal";
import { ApiError } from "../lib/api-client";
import {
  fetchDisputes,
  resolveDispute,
  type ArenaDisputeItem,
  type Paginated,
} from "../lib/admin-api";

const STATUS_TONE: Record<string, BadgeTone> = {
  pending: "warning",
  accepted: "success",
  rejected: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceita",
  rejected: "Rejeitada",
};

export function DisputesPage() {
  const [data, setData] = useState<Paginated<ArenaDisputeItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<{
    item: ArenaDisputeItem;
    action: "accepted" | "rejected";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDisputes({
        page,
        page_size: 20,
        status: statusFilter || undefined,
      });
      setData(result);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar as contestações.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleResolve = async (note: string) => {
    if (!target) return;
    setActionLoading(true);
    try {
      await resolveDispute(target.item.id, target.action, note);
      setTarget(null);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível concluir a ação.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const items = data?.items ?? [];

  return (
    <AdminShell
      title="Contestações"
      subtitle="Pedidos de revisão de avaliações pela comunidade"
    >
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
          <option value="pending">Pendente</option>
          <option value="accepted">Aceita</option>
          <option value="rejected">Rejeitada</option>
        </select>
      </div>

      {loading ? <LoadingState message="Carregando contestações..." /> : null}

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
          title="Nenhuma contestação encontrada"
          description="Contestações de avaliações aparecerão aqui."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="admin-card overflow-x-auto p-2">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Avaliação</th>
                <th>Motivo</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="font-mono text-xs text-slate-400">
                    {item.rating_id.slice(0, 8)}…
                  </td>
                  <td className="max-w-sm truncate text-sm text-slate-200" title={item.reason}>
                    {item.reason}
                  </td>
                  <td>
                    <Badge tone={STATUS_TONE[item.status] ?? "neutral"}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </Badge>
                  </td>
                  <td>{new Date(item.created_at).toLocaleDateString("pt-BR")}</td>
                  <td>
                    {item.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          onClick={() => setTarget({ item, action: "accepted" })}
                        >
                          Aceitar
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setTarget({ item, action: "rejected" })}
                        >
                          Rejeitar
                        </Button>
                      </div>
                    ) : (
                      "—"
                    )}
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

      <ReasonModal
        open={target !== null}
        title={target?.action === "accepted" ? "Aceitar contestação" : "Rejeitar contestação"}
        description="Registre uma nota interna sobre a decisão."
        confirmLabel={target?.action === "accepted" ? "Aceitar" : "Rejeitar"}
        confirmVariant="primary"
        loading={actionLoading}
        onClose={() => setTarget(null)}
        onConfirm={handleResolve}
      />
    </AdminShell>
  );
}
