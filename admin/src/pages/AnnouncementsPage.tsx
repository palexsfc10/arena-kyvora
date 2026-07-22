import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "../components/layout/AdminShell";
import { Badge, type BadgeTone } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { Modal } from "../components/ui/Modal";
import { Pagination } from "../components/ui/Pagination";
import { ApiError } from "../lib/api-client";
import {
  createAnnouncement,
  fetchAnnouncements,
  type Announcement,
  type Paginated,
} from "../lib/admin-api";

const STATUS_TONE: Record<string, BadgeTone> = {
  published: "success",
  draft: "neutral",
  scheduled: "info",
};

const STATUS_LABEL: Record<string, string> = {
  published: "Publicado",
  draft: "Rascunho",
  scheduled: "Agendado",
};

export function AnnouncementsPage() {
  const [data, setData] = useState<Paginated<Announcement> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAnnouncements({ page, page_size: 20 });
      setData(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível carregar os avisos.",
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    if (title.trim().length < 3 || body.trim().length < 10) {
      setFormError("Informe um título e uma mensagem com detalhes suficientes.");
      return;
    }
    setCreating(true);
    setFormError(null);
    try {
      await createAnnouncement({ title: title.trim(), body: body.trim() });
      setModalOpen(false);
      setTitle("");
      setBody("");
      await load();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Não foi possível publicar o aviso.",
      );
    } finally {
      setCreating(false);
    }
  };

  const items = data?.items ?? [];

  return (
    <AdminShell
      title="Avisos"
      subtitle="Comunicados enviados para os usuários da Arena"
      actions={<Button onClick={() => setModalOpen(true)}>Novo aviso</Button>}
    >
      {loading ? <LoadingState message="Carregando avisos..." /> : null}

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
          title="Nenhum aviso publicado"
          description="Crie o primeiro comunicado para os usuários da Arena."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="admin-card overflow-x-auto p-2">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Status</th>
                <th>Publicado em</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {items.map((announcement) => (
                <tr key={announcement.id}>
                  <td className="font-medium text-slate-100">{announcement.title}</td>
                  <td>
                    <Badge tone={STATUS_TONE[announcement.status] ?? "neutral"}>
                      {STATUS_LABEL[announcement.status] ?? announcement.status}
                    </Badge>
                  </td>
                  <td>
                    {announcement.published_at
                      ? new Date(announcement.published_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td>{new Date(announcement.created_at).toLocaleDateString("pt-BR")}</td>
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

      <Modal
        open={modalOpen}
        title="Novo aviso"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button loading={creating} onClick={() => void handleCreate()}>
              Publicar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="admin-label">
            Título
            <input
              type="text"
              className="admin-input mt-1"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="admin-label">
            Mensagem
            <textarea
              className="admin-input mt-1 min-h-[120px]"
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </label>
          {formError ? <p className="text-sm text-red-400">{formError}</p> : null}
        </div>
      </Modal>
    </AdminShell>
  );
}
