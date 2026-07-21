"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AlertTriangle, MessageSquare, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { TeamShield } from "@/components/app/TeamShield";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";
import type { ChallengeCommentItem, ChallengeItem } from "@/lib/arena-types";
import { trackEvent } from "@/lib/analytics";

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceito",
  awaiting_reconfirmation: "Aguardando reconfirmação",
  declined: "Recusado",
  cancelled: "Cancelado",
  expired: "Expirado",
};

const venueLabel: Record<string, string> = {
  yes: "Local disponível",
  no: "Sem local",
  to_arrange: "A combinar",
};

const ACTIVE_COMMENT_STATUSES = new Set(["pending", "accepted", "awaiting_reconfirmation"]);

type EditForm = {
  proposed_date: string;
  proposed_time: string;
  venue_option: string;
  venue_description: string;
  contact_phone: string;
  message: string;
};

function toEditForm(item: ChallengeItem): EditForm {
  return {
    proposed_date: item.proposed_date,
    proposed_time: item.proposed_time ?? "",
    venue_option: item.venue_option,
    venue_description: item.venue_description ?? "",
    contact_phone: item.contact_phone ?? "",
    message: item.message ?? "",
  };
}

function opponentName(item: ChallengeItem): string {
  return item.direction === "sent"
    ? item.recipient_organization_name
    : item.sender_organization_name;
}

function opponentLogo(item: ChallengeItem): string | null {
  return item.direction === "sent" ? item.recipient_logo_url : item.sender_logo_url;
}

function friendlyError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.errorCode === "SCHEDULE_CONFLICT") {
      return "Já existe um compromisso confirmado nesse horário. Escolha outro horário.";
    }
    return err.message;
  }
  return fallback;
}

export default function DesafiosPage() {
  const { selectedTeam, session, refreshPending, refreshNotifications } = useAuth();
  const [items, setItems] = useState<ChallengeItem[]>([]);
  const [direction, setDirection] = useState<"all" | "received" | "sent">("all");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, ChallengeCommentItem[]>>({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const canManage = Boolean(session?.can_manage_selected);

  const load = useCallback(async () => {
    if (!selectedTeam) return;
    setLoading(true);
    setError(null);
    try {
      const data = await arenaApi.listChallenges(selectedTeam.organization_id, {
        direction: direction === "all" ? undefined : direction,
        status: status || undefined,
      });
      setItems(data.items);
      await refreshPending();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar desafios.");
    } finally {
      setLoading(false);
    }
  }, [selectedTeam, direction, status, refreshPending]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(
    challenge: ChallengeItem,
    action: "accept" | "decline" | "cancel" | "reconfirm" | "reject-pending",
  ) {
    if (!selectedTeam) return;
    if (action === "decline" || action === "cancel" || action === "reject-pending") {
      const confirmText =
        action === "decline"
          ? "Recusar este desafio?"
          : action === "cancel"
            ? "Cancelar este desafio?"
            : "Recusar a nova proposta e manter o combinado atual?";
      const ok = window.confirm(confirmText);
      if (!ok) return;
    }
    setMessage(null);
    try {
      if (action === "accept") {
        await arenaApi.acceptChallenge(selectedTeam.organization_id, challenge.id);
        trackEvent("arena_challenge_accepted");
      } else if (action === "decline") {
        await arenaApi.declineChallenge(selectedTeam.organization_id, challenge.id);
        trackEvent("arena_challenge_declined");
      } else if (action === "cancel") {
        await arenaApi.cancelChallenge(selectedTeam.organization_id, challenge.id);
      } else if (action === "reconfirm") {
        await arenaApi.reconfirmChallenge(selectedTeam.organization_id, challenge.id);
      } else {
        await arenaApi.rejectPendingChanges(selectedTeam.organization_id, challenge.id);
      }
      setMessage("Atualizado.");
      await load();
      await refreshNotifications();
    } catch (err) {
      setMessage(friendlyError(err, "Falha na ação."));
    }
  }

  function startEdit(item: ChallengeItem) {
    setEditingId(item.id);
    setEditForm(toEditForm(item));
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  async function submitEdit(event: FormEvent, item: ChallengeItem) {
    event.preventDefault();
    if (!selectedTeam || !editForm) return;
    if (!editForm.proposed_date || !editForm.proposed_time || !editForm.contact_phone) {
      setMessage("Data, horário e telefone de contato são obrigatórios.");
      return;
    }
    setSavingEdit(true);
    setMessage(null);
    try {
      await arenaApi.updateChallenge(selectedTeam.organization_id, item.id, {
        proposed_date: editForm.proposed_date,
        proposed_time: editForm.proposed_time,
        venue_option: editForm.venue_option,
        venue_description: editForm.venue_description || undefined,
        contact_phone: editForm.contact_phone,
        message: editForm.message || undefined,
      });
      setMessage("Desafio atualizado.");
      setEditingId(null);
      setEditForm(null);
      await load();
    } catch (err) {
      setMessage(friendlyError(err, "Falha ao atualizar desafio."));
    } finally {
      setSavingEdit(false);
    }
  }

  async function toggleComments(item: ChallengeItem) {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(item.id);
    setCommentDraft("");
    if (!selectedTeam || comments[item.id]) return;
    setCommentsLoading(true);
    try {
      const data = await arenaApi.listComments(selectedTeam.organization_id, item.id);
      setComments((prev) => ({ ...prev, [item.id]: data.items }));
      await arenaApi.markChallengeNotificationsRead(selectedTeam.organization_id, item.id);
      await refreshNotifications();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Erro ao carregar comentários.");
    } finally {
      setCommentsLoading(false);
    }
  }

  async function submitComment(event: FormEvent, item: ChallengeItem) {
    event.preventDefault();
    if (!selectedTeam || !commentDraft.trim()) return;
    setCommentSubmitting(true);
    try {
      const created = await arenaApi.addComment(
        selectedTeam.organization_id,
        item.id,
        commentDraft.trim(),
      );
      setComments((prev) => ({
        ...prev,
        [item.id]: [...(prev[item.id] ?? []), created],
      }));
      setCommentDraft("");
    } catch (err) {
      setMessage(friendlyError(err, "Falha ao enviar comentário."));
    } finally {
      setCommentSubmitting(false);
    }
  }

  if (!selectedTeam) {
    return (
      <Container className="py-8">
        <p className="text-sm text-muted">Selecione um time.</p>
      </Container>
    );
  }

  return (
    <Container className="py-6 md:py-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Desafios</h1>
      <p className="mt-1 text-sm text-muted">
        Enviados e recebidos pelo time {selectedTeam.name}.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(
          [
            ["all", "Todos"],
            ["received", "Recebidos"],
            ["sent", "Enviados"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setDirection(value)}
            className={`rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              direction === value ? "bg-surface text-ink" : "text-muted"
            }`}
            aria-pressed={direction === value}
          >
            {label}
          </button>
        ))}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm"
          aria-label="Filtrar por status"
        >
          <option value="">Qualquer status</option>
          <option value="pending">Pendentes</option>
          <option value="accepted">Aceitos</option>
          <option value="awaiting_reconfirmation">Aguardando reconfirmação</option>
          <option value="declined">Recusados</option>
          <option value="cancelled">Cancelados</option>
          <option value="expired">Expirados</option>
        </select>
      </div>

      {message ? (
        <p className="mt-4 text-sm text-ink-soft" role="status">
          {message}
        </p>
      ) : null}

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted">Carregando…</p>
        ) : error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted">Nenhum desafio neste filtro.</p>
        ) : (
          <ul className="space-y-5">
            {items.map((item) => {
              const isEditing = editingId === item.id && editForm;
              const isExpanded = expandedId === item.id;
              const writable = ACTIVE_COMMENT_STATUSES.has(item.status);
              const itemComments = comments[item.id] ?? [];

              return (
                <li key={item.id} className="border-b border-line pb-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <TeamShield logoUrl={opponentLogo(item)} name={opponentName(item)} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink" title={opponentName(item)}>
                          {item.direction === "sent" ? "Para " : "De "}
                          {opponentName(item)}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {item.proposed_date}
                          {item.proposed_time ? ` · ${item.proposed_time}` : ""} ·{" "}
                          {venueLabel[item.venue_option] ?? item.venue_option}
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-soft">
                          {statusLabel[item.status] ?? item.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {item.status === "pending" && item.schedule_conflict_hint ? (
                    <p className="mt-3 flex items-start gap-1.5 text-sm text-accent-deep">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      Este horário pode conflitar com outro compromisso já confirmado.
                    </p>
                  ) : null}

                  {item.status === "awaiting_reconfirmation" ? (
                    <div className="mt-3 rounded-md border border-line bg-surface p-3 text-sm">
                      <p className="font-semibold text-ink">Nova proposta aguardando confirmação</p>
                      <p className="mt-1 text-ink-soft">
                        Combinado atual: {item.proposed_date}
                        {item.proposed_time ? ` · ${item.proposed_time}` : ""} ·{" "}
                        {venueLabel[item.venue_option] ?? item.venue_option}
                      </p>
                      <p className="mt-1 text-ink-soft">
                        Proposta nova: {item.pending_proposed_date}
                        {item.pending_proposed_time ? ` · ${item.pending_proposed_time}` : ""}
                        {item.pending_venue_option
                          ? ` · ${venueLabel[item.pending_venue_option] ?? item.pending_venue_option}`
                          : ""}
                      </p>
                      {canManage ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button type="button" size="md" onClick={() => void act(item, "reconfirm")}>
                            Reconfirmar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => void act(item, "reject-pending")}
                          >
                            Recusar proposta
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {item.contact_phone ? (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-soft">
                      <Phone className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                      {item.contact_phone}
                    </p>
                  ) : null}

                  {item.message ? (
                    <p className="mt-2 text-sm text-ink-soft">{item.message}</p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.status === "pending" && canManage ? (
                      item.direction === "received" ? (
                        <>
                          <Button type="button" onClick={() => void act(item, "accept")}>
                            Aceitar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => void act(item, "decline")}
                          >
                            Recusar
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void act(item, "cancel")}
                        >
                          Cancelar envio
                        </Button>
                      )
                    ) : null}

                    {(item.status === "accepted" || item.status === "awaiting_reconfirmation") &&
                    canManage &&
                    !isEditing ? (
                      <Button type="button" variant="outline" onClick={() => startEdit(item)}>
                        Editar
                      </Button>
                    ) : null}

                    <Button
                      type="button"
                      variant="ghost"
                      className="gap-1.5"
                      onClick={() => void toggleComments(item)}
                    >
                      <MessageSquare className="h-4 w-4" aria-hidden />
                      {isExpanded ? "Ocultar comentários" : "Comentários"}
                    </Button>
                  </div>

                  {isEditing && editForm ? (
                    <form
                      onSubmit={(e) => void submitEdit(e, item)}
                      className="mt-4 grid gap-3 rounded-md border border-line bg-surface p-4 sm:grid-cols-2"
                    >
                      <label className="text-sm">
                        <span className="mb-1 block text-muted">Data proposta</span>
                        <input
                          type="date"
                          required
                          value={editForm.proposed_date}
                          onChange={(e) =>
                            setEditForm({ ...editForm, proposed_date: e.target.value })
                          }
                          className="w-full rounded-md border border-line bg-white px-3 py-2.5"
                        />
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block text-muted">Horário</span>
                        <input
                          type="time"
                          required
                          value={editForm.proposed_time}
                          onChange={(e) =>
                            setEditForm({ ...editForm, proposed_time: e.target.value })
                          }
                          className="w-full rounded-md border border-line bg-white px-3 py-2.5"
                        />
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block text-muted">Local</span>
                        <select
                          value={editForm.venue_option}
                          onChange={(e) =>
                            setEditForm({ ...editForm, venue_option: e.target.value })
                          }
                          className="w-full rounded-md border border-line bg-white px-3 py-2.5"
                        >
                          <option value="to_arrange">A combinar</option>
                          <option value="yes">Local disponível</option>
                          <option value="no">Sem local</option>
                        </select>
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block text-muted">Telefone de contato</span>
                        <input
                          type="tel"
                          required
                          minLength={8}
                          maxLength={32}
                          value={editForm.contact_phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, contact_phone: e.target.value })
                          }
                          className="w-full rounded-md border border-line bg-white px-3 py-2.5"
                        />
                      </label>
                      <label className="text-sm sm:col-span-2">
                        <span className="mb-1 block text-muted">Detalhes do local (opcional)</span>
                        <input
                          maxLength={200}
                          value={editForm.venue_description}
                          onChange={(e) =>
                            setEditForm({ ...editForm, venue_description: e.target.value })
                          }
                          className="w-full rounded-md border border-line bg-white px-3 py-2.5"
                        />
                      </label>
                      <label className="text-sm sm:col-span-2">
                        <span className="mb-1 block text-muted">Mensagem (opcional)</span>
                        <textarea
                          maxLength={500}
                          rows={2}
                          value={editForm.message}
                          onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                          className="w-full rounded-md border border-line bg-white px-3 py-2.5"
                        />
                      </label>
                      <div className="flex gap-2 sm:col-span-2">
                        <Button type="submit" disabled={savingEdit}>
                          {savingEdit ? "Salvando…" : "Salvar alterações"}
                        </Button>
                        <Button type="button" variant="outline" onClick={cancelEdit}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : null}

                  {isExpanded ? (
                    <div className="mt-4 rounded-md border border-line p-4">
                      {commentsLoading ? (
                        <p className="text-sm text-muted">Carregando comentários…</p>
                      ) : itemComments.length === 0 ? (
                        <p className="text-sm text-muted">Nenhum comentário ainda.</p>
                      ) : (
                        <ul className="space-y-3">
                          {itemComments.map((comment) => (
                            <li key={comment.id} className="text-sm">
                              <p className="font-medium text-ink">
                                {comment.author_organization_name}
                              </p>
                              <p className="text-ink-soft">{comment.body}</p>
                            </li>
                          ))}
                        </ul>
                      )}

                      {canManage && writable ? (
                        <form
                          onSubmit={(e) => void submitComment(e, item)}
                          className="mt-3 flex flex-col gap-2 sm:flex-row"
                        >
                          <textarea
                            value={commentDraft}
                            onChange={(e) => setCommentDraft(e.target.value)}
                            maxLength={1000}
                            rows={1}
                            placeholder="Escreva um comentário…"
                            className="flex-1 rounded-md border border-line bg-white px-3 py-2.5 text-sm"
                          />
                          <Button
                            type="submit"
                            disabled={commentSubmitting || !commentDraft.trim()}
                          >
                            Enviar
                          </Button>
                        </form>
                      ) : canManage ? (
                        <p className="mt-3 text-xs text-muted">
                          Este desafio não permite novos comentários.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Container>
  );
}
