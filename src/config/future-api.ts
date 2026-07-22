/**
 * Reserved surface for future Kyvora public API integration.
 * Not wired in this landing release — document-only contracts.
 */

export type FutureApiEndpoint = {
  id: string;
  method: "GET" | "POST" | "PATCH";
  path: string;
  purpose: string;
  notes: string;
};

export const futureApiBaseUrlEnv = "NEXT_PUBLIC_KYVORA_API_BASE_URL";

export const futureEndpoints: FutureApiEndpoint[] = [
  {
    id: "teams.search",
    method: "GET",
    path: "/public/v1/teams",
    purpose: "Buscar times por cidade, região e modalidade",
    notes: "Respeitar privacidade do time; rate limiting obrigatório",
  },
  {
    id: "teams.profile",
    method: "GET",
    path: "/public/v1/teams/:slug",
    purpose: "Perfil público autorizado pelo dirigente",
    notes: "Não expor endereços privados nem dados sensíveis",
  },
  {
    id: "availability.list",
    method: "GET",
    path: "/public/v1/availability",
    purpose: "Consultar disponibilidade pública para jogos",
    notes: "Somente janelas explicitamente publicadas",
  },
  {
    id: "challenges.create",
    method: "POST",
    path: "/public/v1/challenges",
    purpose: "Enviar desafio entre times autenticados",
    notes: "Exige identidade compartilhada com Kyvora Gestão de Times",
  },
  {
    id: "challenges.respond",
    method: "PATCH",
    path: "/public/v1/challenges/:id",
    purpose: "Aceitar, recusar ou negociar desafio",
    notes: "Pode gerar registro de jogo na gestão quando confirmado",
  },
];
