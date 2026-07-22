import type { ArenaSession } from "@/lib/arena-types";

/**
 * Decide the next Arena route after authentication.
 * Backend remains the source of truth for membership and arena_enabled.
 */
export function routeAfterSession(session: ArenaSession): string {
  if (session.teams.length === 0) {
    return "/app/criar-time";
  }
  if (session.teams.length > 1 && !session.selected_organization_id) {
    return "/app/selecionar-time";
  }
  const selected =
    session.teams.find((t) => t.organization_id === session.selected_organization_id) ??
    (session.teams.length === 1 ? session.teams[0] : null);

  if (!selected) {
    return "/app/selecionar-time";
  }
  if (!selected.arena_enabled && selected.can_manage) {
    return "/app/ativar-participacao";
  }
  return "/app/explorar";
}
