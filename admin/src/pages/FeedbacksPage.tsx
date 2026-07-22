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
  fetchFeedbacks,
  updateFeedback,
  type ArenaFeedbackItem,
  type Paginated,
} from "../lib/admin-api";

const STATUS_TONE: Record<string, BadgeTone> = {
  new: "warning",
  under_review: "info",
  planned: "info",
  completed: "success",
  dismissed: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Novo",
  under_review: "Em análise",
  planned: "Planejado",
  completed: "Concluído",
  dismissed: "Descartado",
};

const TYPE_LABEL: Record<string, string> = {
  suggestion: "Sugestão",
  improvement: "Melhoria",
  problem: "Problema",
  compliment: "Elogio",
};

const OPEN_STATUSES = new Set(["new", "under_review", "planned"]);

export function FeedbacksPage() {
  const [data, setData] = useState<Paginated<ArenaFeedbackItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<{
    item: ArenaFeedbackItem;
    status: "completed" | "dismissed" | "under_review";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFeedbacks({
        page,
        page_size: 20,
        status: statusFilter || undefined,
      });
      setData(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível carregar os feedbacks.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpdate = async (adminNote: string) => {
    if (!target) return;
    setActionLoading(true);
    try {
      await updateFeedback(target.item.id, {
        status: target.status,
        admin_note: adminNote,
      });
      setTarget(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível concluir a ação.");
    } finally {
      setActionLoading(false);
    }
  };

  const items = data?.items ?? [];

  return (
    <AdminShell title="Feedbacks" subtitle="Sugestões, problemas e elogios enviados pela comunidade">
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
          <option value="new">Novo</option>
          <option value="under_review">Em análise</option>
          <option value="planned">Planejado</option>
          <option value="completed">Concluído</option>
          <option value="dismissed">Descartado</option>
        </select>
      </div>

      {loading ? <LoadingState message="Carregando feedbacks..." /> : null}

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
          title="Nenhum feedback encontrado"
          description="Mensagens enviadas pela comunidade aparecerão aqui."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="admin-card overflow-x-auto p-2">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Assunto</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{TYPE_LABEL[item.feedback_type] ?? item.feedback_type}</td>
                  <td className="max-w-xs">
                    <p className="truncate font-medium text-slate-100">{item.subject}</p>
                    <p className="truncate text-xs text-slate-500">{item.body}</p>
                  </td>
                  <td>
                    <Badge tone={STATUS_TONE[item.status] ?? "neutral"}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </Badge>
                  </td>
                  <td>{new Date(item.created_at).toLocaleDateString("pt-BR")}</td>
                  <td>
                    {OPEN_STATUSES.has(item.status) ? (
                      <div className="flex gap-2">
                        {item.status === "new" ? (
                          <Button
                            variant="secondary"
                            onClick={() => setTarget({ item, status: "under_review" })}
                          >
                            Analisar
                          </Button>
                        ) : null}
                        <Button
                          variant="primary"
                          onClick={() => setTarget({ item, status: "completed" })}
                        >
                          Concluir
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setTarget({ item, status: "dismissed" })}
                        >
                          Descartar
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
        title={
          target?.status === "completed"
            ? "Concluir feedback"
            : target?.status === "dismissed"
              ? "Descartar feedback"
              : "Marcar em análise"
        }
        description="Registre uma nota interna sobre esta decisão."
        confirmLabel="Confirmar"
        confirmVariant="primary"
        loading={actionLoading}
        onClose={() => setTarget(null)}
        onConfirm={handleUpdate}
      />
    </AdminShell>
  );
}
