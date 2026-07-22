import { apiClient, ApiError } from "./api-client";

/** Role required to access the Arena Admin panel. */
export const ARENA_PLATFORM_ADMIN_ROLE = "arena_platform_admin";

interface ApiSuccess<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ListParams {
  page?: number;
  page_size?: number;
  q?: string;
  status?: string;
  [key: string]: string | number | boolean | undefined;
}

function unwrap<T>(payload: ApiSuccess<T>): T {
  if (payload.data === undefined) {
    throw new ApiError("Resposta inválida da API.", 500);
  }
  return payload.data;
}

function emptyPage<T>(): Paginated<T> {
  return {
    items: [],
    pagination: {
      page: 1,
      page_size: 20,
      total_items: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  access_token: string;
  expires_in?: number;
}

export interface AdminSessionUser {
  id: string;
  name: string;
  email: string;
}

export interface AdminSession {
  user: AdminSessionUser;
  role: string;
  permissions?: string[];
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResult> {
  const { data } = await apiClient.post<ApiSuccess<LoginResult>>(
    "/api/v1/auth/login",
    payload,
  );
  if (!data.data?.access_token) {
    throw new ApiError("E-mail ou senha inválidos.", 401, "INVALID_CREDENTIALS");
  }
  return data.data;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post("/api/v1/auth/logout");
}

export async function fetchAdminSession(): Promise<AdminSession> {
  const { data } = await apiClient.get<ApiSuccess<AdminSession>>(
    "/api/v1/admin/arena/session",
  );
  return unwrap(data);
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

export interface OverviewStats {
  teams_total: number;
  teams_active: number;
  users_total: number;
  challenges_active: number;
  moderation_pending: number;
  announcements_published: number;
}

export async function fetchOverview(): Promise<OverviewStats> {
  const { data } = await apiClient.get<ApiSuccess<OverviewStats>>(
    "/api/v1/admin/arena/overview",
  );
  return unwrap(data);
}

/* ------------------------------------------------------------------ */
/* Teams                                                               */
/* ------------------------------------------------------------------ */

export interface TeamSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
  member_count: number;
  captain_name?: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joined_at: string;
}

export interface TeamDetail extends TeamSummary {
  description?: string | null;
  members: TeamMember[];
  updated_at: string;
}

export async function fetchTeams(
  params: ListParams = {},
): Promise<Paginated<TeamSummary>> {
  try {
    const { data } = await apiClient.get<ApiSuccess<Paginated<TeamSummary>>>(
      "/api/v1/admin/arena/teams",
      { params },
    );
    return unwrap(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return emptyPage();
    throw error;
  }
}

export async function fetchTeam(id: string): Promise<TeamDetail> {
  const { data } = await apiClient.get<ApiSuccess<TeamDetail>>(
    `/api/v1/admin/arena/teams/${id}`,
  );
  return unwrap(data);
}

export async function suspendTeam(id: string, reason: string): Promise<void> {
  await apiClient.post(`/api/v1/admin/arena/teams/${id}/suspend`, { reason });
}

export async function reactivateTeam(id: string, reason: string): Promise<void> {
  await apiClient.post(`/api/v1/admin/arena/teams/${id}/reactivate`, { reason });
}

/* ------------------------------------------------------------------ */
/* Users                                                                */
/* ------------------------------------------------------------------ */

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  status: string;
  team_name?: string | null;
  created_at: string;
  last_login_at?: string | null;
}

export async function fetchUsers(
  params: ListParams = {},
): Promise<Paginated<AdminUserSummary>> {
  try {
    const { data } = await apiClient.get<ApiSuccess<Paginated<AdminUserSummary>>>(
      "/api/v1/admin/arena/users",
      { params },
    );
    return unwrap(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return emptyPage();
    throw error;
  }
}

export async function suspendUser(id: string, reason: string): Promise<void> {
  await apiClient.post(`/api/v1/admin/arena/users/${id}/suspend`, { reason });
}

export async function reactivateUser(id: string, reason: string): Promise<void> {
  await apiClient.post(`/api/v1/admin/arena/users/${id}/reactivate`, { reason });
}

/* ------------------------------------------------------------------ */
/* Challenges                                                          */
/* ------------------------------------------------------------------ */

export interface ChallengeSummary {
  id: string;
  title: string;
  status: string;
  category?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  participant_count: number;
}

export async function fetchChallenges(
  params: ListParams = {},
): Promise<Paginated<ChallengeSummary>> {
  try {
    const { data } = await apiClient.get<ApiSuccess<Paginated<ChallengeSummary>>>(
      "/api/v1/admin/arena/challenges",
      { params },
    );
    return unwrap(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return emptyPage();
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/* Moderation                                                           */
/* ------------------------------------------------------------------ */

export interface ModerationItem {
  id: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  reported_by?: string | null;
  status: string;
  created_at: string;
}

export async function fetchModerationQueue(
  params: ListParams = {},
): Promise<Paginated<ModerationItem>> {
  try {
    const { data } = await apiClient.get<ApiSuccess<Paginated<ModerationItem>>>(
      "/api/v1/admin/arena/moderation",
      { params },
    );
    return unwrap(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return emptyPage();
    throw error;
  }
}

export async function resolveModerationItem(
  id: string,
  action: "approve" | "reject",
  reason: string,
): Promise<void> {
  await apiClient.post(`/api/v1/admin/arena/moderation/${id}/resolve`, {
    action,
    reason,
  });
}

/* ------------------------------------------------------------------ */
/* Announcements                                                        */
/* ------------------------------------------------------------------ */

export interface Announcement {
  id: string;
  title: string;
  body: string;
  status: string;
  published_at?: string | null;
  created_at: string;
}

export interface CreateAnnouncementPayload {
  title: string;
  body: string;
}

export async function fetchAnnouncements(
  params: ListParams = {},
): Promise<Paginated<Announcement>> {
  try {
    const { data } = await apiClient.get<ApiSuccess<Paginated<Announcement>>>(
      "/api/v1/admin/arena/announcements",
      { params },
    );
    return unwrap(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return emptyPage();
    throw error;
  }
}

export async function createAnnouncement(
  payload: CreateAnnouncementPayload,
): Promise<Announcement> {
  const { data } = await apiClient.post<ApiSuccess<Announcement>>(
    "/api/v1/admin/arena/announcements",
    payload,
  );
  return unwrap(data);
}

/* ------------------------------------------------------------------ */
/* Audit                                                                */
/* ------------------------------------------------------------------ */

export interface AuditLogEntry {
  id: string;
  created_at: string;
  action: string;
  actor_email?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  reason?: string | null;
}

export async function fetchAuditLogs(
  params: ListParams = {},
): Promise<Paginated<AuditLogEntry>> {
  try {
    const { data } = await apiClient.get<ApiSuccess<Paginated<AuditLogEntry>>>(
      "/api/v1/admin/arena/audit",
      { params },
    );
    return unwrap(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return emptyPage();
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/* Settings                                                             */
/* ------------------------------------------------------------------ */

export interface PlatformSettings {
  registrations_open: boolean;
  maintenance_mode: boolean;
  support_email?: string | null;
  [key: string]: unknown;
}

export async function fetchSettings(): Promise<PlatformSettings> {
  const { data } = await apiClient.get<ApiSuccess<PlatformSettings>>(
    "/api/v1/admin/arena/settings",
  );
  return unwrap(data);
}

export async function updateSettings(
  payload: Partial<PlatformSettings>,
): Promise<PlatformSettings> {
  const { data } = await apiClient.patch<ApiSuccess<PlatformSettings>>(
    "/api/v1/admin/arena/settings",
    payload,
  );
  return unwrap(data);
}
