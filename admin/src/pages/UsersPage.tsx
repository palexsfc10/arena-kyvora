import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { AdminShell } from "../components/layout/AdminShell";
import { Badge, type BadgeTone } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { Pagination } from "../components/ui/Pagination";
import { ReasonModal } from "../components/ui/ReasonModal";
import { Button } from "../components/ui/Button";
import { ApiError } from "../lib/api-client";
import {
  fetchUsers,
  reactivateUser,
  suspendUser,
  type AdminUserSummary,
  type Paginated,
} from "../lib/admin-api";

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

export function UsersPage() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<Paginated<AdminUserSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<AdminUserSummary | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchUsers({ page, page_size: 20, q: search || undefined });
      setData(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível carregar os usuários.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAction = async (reason: string) => {
    if (!target) return;
    setActionLoading(true);
    try {
      if (target.status === "suspended") {
        await reactivateUser(target.id, reason);
      } else {
        await suspendUser(target.id, reason);
      }
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
    <AdminShell title="Usuários" subtitle="Gerencie as contas de usuários da Arena">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          className="admin-input max-w-xs"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
        />
      </div>

      {loading ? <LoadingState message="Carregando usuários..." /> : null}

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
          title="Nenhum usuário encontrado"
          description="Ajuste os filtros ou aguarde novos cadastros."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="admin-card overflow-x-auto p-2">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Time</th>
                <th>Status</th>
                <th>Último login</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.team_name ?? "—"}</td>
                  <td>
                    <Badge tone={STATUS_TONE[user.status] ?? "neutral"}>
                      {STATUS_LABEL[user.status] ?? user.status}
                    </Badge>
                  </td>
                  <td>
                    {user.last_login_at
                      ? new Date(user.last_login_at).toLocaleDateString("pt-BR")
                      : "nunca"}
                  </td>
                  <td>
                    <Button
                      variant={user.status === "suspended" ? "primary" : "danger"}
                      onClick={() => setTarget(user)}
                    >
                      {user.status === "suspended" ? "Reativar" : "Suspender"}
                    </Button>
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
        title={target?.status === "suspended" ? "Reativar usuário" : "Suspender usuário"}
        description={`Ação para: ${target?.name ?? ""}`}
        confirmLabel={target?.status === "suspended" ? "Reativar" : "Suspender"}
        confirmVariant={target?.status === "suspended" ? "primary" : "danger"}
        loading={actionLoading}
        onClose={() => setTarget(null)}
        onConfirm={handleAction}
      />
    </AdminShell>
  );
}
