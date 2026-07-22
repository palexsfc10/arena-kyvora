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
  fetchRatings,
  invalidateRating,
  type ArenaRatingItem,
  type Paginated,
} from "../lib/admin-api";

const STATUS_TONE: Record<string, BadgeTone> = {
  submitted: "info",
  visible: "success",
  invalidated: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  submitted: "Enviada",
  visible: "Visível",
  invalidated: "Invalidada",
};

export function RatingsPage() {
  const [data, setData] = useState<Paginated<ArenaRatingItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<ArenaRatingItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRatings({
        page,
        page_size: 20,
        status: statusFilter || undefined,
      });
      setData(result);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar as avaliações.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleInvalidate = async (reason: string) => {
    if (!target) return;
    setActionLoading(true);
    try {
      await invalidateRating(target.id, reason);
      setTarget(null);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível invalidar.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const items = data?.items ?? [];

  return (
    <AdminShell
      title="Avaliações"
      subtitle="Avaliações bilaterais pós-partida da comunidade Arena"
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
          <option value="submitted">Enviada</option>
          <option value="visible">Visível</option>
          <option value="invalidated">Invalidada</option>
        </select>
      </div>

      {loading ? <LoadingState message="Carregando avaliações..." /> : null}

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
          title="Nenhuma avaliação encontrada"
          description="Avaliações enviadas pelos times aparecerão aqui."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="admin-card overflow-x-auto p-2">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Avaliador</th>
                <th>Avaliado</th>
                <th>Notas</th>
                <th>Partida</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.reviewer_organization_name ?? item.reviewer_organization_id}</td>
                  <td>{item.reviewed_organization_name ?? item.reviewed_organization_id}</td>
                  <td className="text-xs text-slate-400">
                    G{item.overall} · P{item.punctuality} · O{item.organization_score} · F
                    {item.fair_play} · C{item.communication}
                  </td>
                  <td>{item.match_happened ? "Ocorreu" : "Não ocorreu"}</td>
                  <td>
                    <Badge tone={STATUS_TONE[item.status] ?? "neutral"}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </Badge>
                  </td>
                  <td>{new Date(item.created_at).toLocaleDateString("pt-BR")}</td>
                  <td>
                    {item.status !== "invalidated" ? (
                      <Button variant="danger" onClick={() => setTarget(item)}>
                        Invalidar
                      </Button>
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
        title="Invalidar avaliação"
        description="Informe o motivo. A avaliação deixará de contar na reputação."
        confirmLabel="Invalidar"
        confirmVariant="danger"
        loading={actionLoading}
        onClose={() => setTarget(null)}
        onConfirm={handleInvalidate}
      />
    </AdminShell>
  );
}
