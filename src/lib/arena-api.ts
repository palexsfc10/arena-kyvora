import { env } from "@/config/env";
import { apiRequest, ApiError } from "@/lib/api-client";
import { setAccessToken, clearAccessToken, getAccessToken } from "@/lib/auth-storage";
import type {
  ArenaNotificationItem,
  ArenaSession,
  AvailabilityItem,
  ChallengeCommentItem,
  ChallengeItem,
  NextMatchItem,
  Paginated,
  PaginatedNotifications,
  TeamSettings,
} from "@/lib/arena-types";
import type { ApiSuccess } from "@/lib/arena-types";

export async function registerArena(payload: {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  accept_terms: boolean;
}) {
  return apiRequest<{ email: string; verification_required: boolean }>(
    "/api/v1/arena/auth/register",
    { method: "POST", body: payload, auth: false },
  );
}

export async function forgotPasswordArena(email: string) {
  return apiRequest("/api/v1/arena/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export async function resetPasswordArena(payload: {
  token: string;
  password: string;
  confirm_password: string;
}) {
  return apiRequest("/api/v1/arena/auth/reset-password", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function verifyEmailArena(token: string) {
  return apiRequest("/api/v1/arena/auth/verify-email", {
    method: "POST",
    body: { token },
    auth: false,
  });
}

export async function resendVerificationArena() {
  return apiRequest("/api/v1/arena/auth/resend-verification", {
    method: "POST",
  });
}

export async function createTeam(body: Record<string, unknown>) {
  const data = await apiRequest<{
    access_token: string;
    team: ArenaSession["teams"][number];
    settings: TeamSettings;
  }>("/api/v1/arena/teams", { method: "POST", body });
  setAccessToken(data.access_token);
  return data;
}

export async function login(email: string, password: string): Promise<void> {
  const data = await apiRequest<{ access_token: string; expires_in: number }>(
    "/api/v1/auth/login",
    {
      method: "POST",
      body: { email, password },
      auth: false,
    },
  );
  setAccessToken(data.access_token);
}

export async function logout(): Promise<void> {
  try {
    await apiRequest("/api/v1/auth/logout", { method: "POST" });
  } catch {
    // still clear local session
  } finally {
    clearAccessToken();
  }
}

export function getSession() {
  return apiRequest<ArenaSession>("/api/v1/arena/session");
}

export async function selectTeam(organizationId: string) {
  const data = await apiRequest<{
    access_token: string;
    team: ArenaSession["teams"][number];
  }>("/api/v1/arena/select-team", {
    method: "POST",
    body: { organization_id: organizationId },
  });
  setAccessToken(data.access_token);
  return data;
}

export function exploreAvailabilities(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const qs = query.toString();
  return apiRequest<Paginated<AvailabilityItem>>(
    `/api/v1/arena/explore${qs ? `?${qs}` : ""}`,
  );
}

export function listMyAvailabilities(organizationId: string) {
  return apiRequest<AvailabilityItem[]>(
    `/api/v1/arena/teams/${organizationId}/availabilities`,
  );
}

export function createAvailability(
  organizationId: string,
  body: Record<string, unknown>,
) {
  return apiRequest<AvailabilityItem>(
    `/api/v1/arena/teams/${organizationId}/availabilities`,
    { method: "POST", body },
  );
}

export function cancelAvailability(organizationId: string, availabilityId: string) {
  return apiRequest<AvailabilityItem>(
    `/api/v1/arena/teams/${organizationId}/availabilities/${availabilityId}/cancel`,
    { method: "POST" },
  );
}

export function createChallenge(
  organizationId: string,
  body: Record<string, unknown>,
) {
  return apiRequest<ChallengeItem>(
    `/api/v1/arena/teams/${organizationId}/challenges`,
    { method: "POST", body },
  );
}

export function listChallenges(
  organizationId: string,
  params: Record<string, string | undefined> = {},
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const qs = query.toString();
  return apiRequest<Paginated<ChallengeItem>>(
    `/api/v1/arena/teams/${organizationId}/challenges${qs ? `?${qs}` : ""}`,
  );
}

export function pendingCount(organizationId: string) {
  return apiRequest<{ pending_received: number }>(
    `/api/v1/arena/teams/${organizationId}/challenges/pending-count`,
  );
}

export function acceptChallenge(organizationId: string, challengeId: string) {
  return apiRequest<ChallengeItem>(
    `/api/v1/arena/teams/${organizationId}/challenges/${challengeId}/accept`,
    { method: "POST" },
  );
}

export function declineChallenge(organizationId: string, challengeId: string) {
  return apiRequest<ChallengeItem>(
    `/api/v1/arena/teams/${organizationId}/challenges/${challengeId}/decline`,
    { method: "POST" },
  );
}

export function cancelChallenge(organizationId: string, challengeId: string) {
  return apiRequest<ChallengeItem>(
    `/api/v1/arena/teams/${organizationId}/challenges/${challengeId}/cancel`,
    { method: "POST" },
  );
}

export function getTeamSettings(organizationId: string) {
  return apiRequest<TeamSettings>(
    `/api/v1/arena/teams/${organizationId}/settings`,
  );
}

export function updateTeamSettings(
  organizationId: string,
  body: Record<string, unknown>,
) {
  return apiRequest<TeamSettings>(
    `/api/v1/arena/teams/${organizationId}/settings`,
    { method: "PATCH", body },
  );
}

export function updateChallenge(
  organizationId: string,
  challengeId: string,
  body: Record<string, unknown>,
) {
  return apiRequest<ChallengeItem>(
    `/api/v1/arena/teams/${organizationId}/challenges/${challengeId}`,
    { method: "PATCH", body },
  );
}

export function reconfirmChallenge(organizationId: string, challengeId: string) {
  return apiRequest<ChallengeItem>(
    `/api/v1/arena/teams/${organizationId}/challenges/${challengeId}/reconfirm`,
    { method: "POST" },
  );
}

export function rejectPendingChanges(organizationId: string, challengeId: string) {
  return apiRequest<ChallengeItem>(
    `/api/v1/arena/teams/${organizationId}/challenges/${challengeId}/reject-pending`,
    { method: "POST" },
  );
}

export function listComments(
  organizationId: string,
  challengeId: string,
  params: Record<string, string | undefined> = {},
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const qs = query.toString();
  return apiRequest<Paginated<ChallengeCommentItem>>(
    `/api/v1/arena/teams/${organizationId}/challenges/${challengeId}/comments${qs ? `?${qs}` : ""}`,
  );
}

export function addComment(
  organizationId: string,
  challengeId: string,
  body: string,
) {
  return apiRequest<ChallengeCommentItem>(
    `/api/v1/arena/teams/${organizationId}/challenges/${challengeId}/comments`,
    { method: "POST", body: { body } },
  );
}

export function listNotifications(
  organizationId: string,
  params: Record<string, string | undefined> = {},
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const qs = query.toString();
  return apiRequest<PaginatedNotifications>(
    `/api/v1/arena/teams/${organizationId}/notifications${qs ? `?${qs}` : ""}`,
  );
}

export function unreadNotificationCount(organizationId: string) {
  return apiRequest<{ unread_count: number }>(
    `/api/v1/arena/teams/${organizationId}/notifications/unread-count`,
  );
}

export function markNotificationRead(organizationId: string, notificationId: string) {
  return apiRequest<ArenaNotificationItem>(
    `/api/v1/arena/teams/${organizationId}/notifications/${notificationId}/read`,
    { method: "POST" },
  );
}

export function markChallengeNotificationsRead(
  organizationId: string,
  challengeId: string,
) {
  return apiRequest<{ marked: number }>(
    `/api/v1/arena/teams/${organizationId}/challenges/${challengeId}/notifications/read`,
    { method: "POST" },
  );
}

export async function getNextMatch(organizationId: string) {
  const data = await apiRequest<NextMatchItem | null | undefined>(
    `/api/v1/arena/teams/${organizationId}/next-match`,
  );
  // Backend omits `data` when there is no accepted future match.
  return data && typeof data === "object" && "challenge_id" in data ? data : null;
}

async function uploadOrDeleteLogo(
  organizationId: string,
  method: "POST" | "DELETE",
  formData?: FormData,
): Promise<{ logo_url: string | null }> {
  const token = getAccessToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Arena wrapper: Gestão /organizations/current/logo requires subscription writes.
  const response = await fetch(
    `${env.apiBaseUrl}/api/v1/arena/teams/${organizationId}/logo`,
    {
      method,
      credentials: "include",
      headers,
      body: formData,
    },
  );

  const json = (await response.json().catch(() => null)) as ApiSuccess<{
    logo_url?: string | null;
  }> | null;

  if (!response.ok) {
    throw new ApiError(
      json?.message ?? "Não foi possível concluir a solicitação.",
      response.status,
      json?.error_code,
    );
  }

  return { logo_url: json?.data?.logo_url ?? null };
}

export function uploadTeamLogo(organizationId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return uploadOrDeleteLogo(organizationId, "POST", formData);
}

export function deleteTeamLogo(organizationId: string) {
  return uploadOrDeleteLogo(organizationId, "DELETE");
}
