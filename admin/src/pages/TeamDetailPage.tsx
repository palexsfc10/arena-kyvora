import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { AdminShell } from "../components/layout/AdminShell";
import { Badge, type BadgeTone } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { ReasonModal } from "../components/ui/ReasonModal";
import { ApiError } from "../lib/api-client";
import {
  fetchTeam,
  reactivateTeam,
  suspendTeam,
  type TeamDetail,
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

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<"suspend" | "reactivate" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTeam(id);
      setTeam(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar os dados do time.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAction = async (reason: string) => {
    if (!id || !modalAction) return;
    setActionLoading(true);
    try {
      if (modalAction === "suspend") {
        await suspendTeam(id, reason);
      } else {
        await reactivateTeam(id, reason);
      }
      setModalAction(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível concluir a ação.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminShell
      title={team?.name ?? "Time"}
      subtitle="Detalhes do time"
      actions={
        <Button variant="secondary" onClick={() => navigate("/teams")}>
          Voltar
        </Button>
      }
    >
      {loading ? <LoadingState message="Carregando time..." /> : null}

      {error ? (
        <div className="admin-card mb-4 border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {!loading && !team && !error ? (
        <EmptyState title="Time não encontrado" />
      ) : null}

      {!loading && team ? (
        <div className="space-y-6">
          <div className="admin-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-100">{team.name}</h2>
                  <Badge tone={STATUS_TONE[team.status] ?? "neutral"}>
                    {STATUS_LABEL[team.status] ?? team.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">{team.slug}</p>
                {team.description ? (
                  <p className="mt-2 max-w-xl text-sm text-slate-400">{team.description}</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                {team.status === "suspended" ? (
                  <Button variant="primary" onClick={() => setModalAction("reactivate")}>
                    Reativar
                  </Button>
                ) : (
                  <Button variant="danger" onClick={() => setModalAction("suspend")}>
                    Suspender
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="admin-card p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Membros ({team.members.length})
            </h3>
            {team.members.length === 0 ? (
              <EmptyState title="Nenhum membro cadastrado" />
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Função</th>
                    <th>Entrou em</th>
                  </tr>
                </thead>
                <tbody>
                  {team.members.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <Link
                          to={`/users?q=${encodeURIComponent(member.email)}`}
                          className="text-sky-400 hover:underline"
                        >
                          {member.name}
                        </Link>
                      </td>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                      <td>{new Date(member.joined_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : null}

      <ReasonModal
        open={modalAction !== null}
        title={modalAction === "suspend" ? "Suspender time" : "Reativar time"}
        description={
          modalAction === "suspend"
            ? "O time ficará indisponível para os membros até ser reativado."
            : "O time voltará a operar normalmente."
        }
        confirmLabel={modalAction === "suspend" ? "Suspender" : "Reativar"}
        confirmVariant={modalAction === "suspend" ? "danger" : "primary"}
        loading={actionLoading}
        onClose={() => setModalAction(null)}
        onConfirm={handleAction}
      />
    </AdminShell>
  );
}
