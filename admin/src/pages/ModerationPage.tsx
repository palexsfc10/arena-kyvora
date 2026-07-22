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
  fetchModerationQueue,
  resolveModerationItem,
  type ModerationItem,
  type Paginated,
} from "../lib/admin-api";

const STATUS_TONE: Record<string, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

export function ModerationPage() {
  const [data, setData] = useState<Paginated<ModerationItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<{
    item: ModerationItem;
    action: "approve" | "reject";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchModerationQueue({ page, page_size: 20 });
      setData(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível carregar a fila de moderação.",
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleResolve = async (reason: string) => {
    if (!target) return;
    setActionLoading(true);
    try {
      await resolveModerationItem(target.item.id, target.action, reason);
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
    <AdminShell title="Moderação" subtitle="Denúncias e conteúdos pendentes de revisão">
      {loading ? <LoadingState message="Carregando fila de moderação..." /> : null}

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
          title="Nenhum item pendente"
          description="A fila de moderação está vazia por enquanto."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="admin-card overflow-x-auto p-2">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Motivo</th>
                <th>Reportado por</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.entity_type}</td>
                  <td className="max-w-xs truncate">{item.reason}</td>
                  <td>{item.reported_by ?? "—"}</td>
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
                          onClick={() => setTarget({ item, action: "approve" })}
                        >
                          Aprovar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => setTarget({ item, action: "reject" })}
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
        title={target?.action === "approve" ? "Aprovar item" : "Rejeitar item"}
        description="Registre o motivo da decisão para fins de auditoria."
        confirmLabel={target?.action === "approve" ? "Aprovar" : "Rejeitar"}
        confirmVariant={target?.action === "approve" ? "primary" : "danger"}
        loading={actionLoading}
        onClose={() => setTarget(null)}
        onConfirm={handleResolve}
      />
    </AdminShell>
  );
}
