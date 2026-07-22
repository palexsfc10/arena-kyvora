export type ArenaTeamSummary = {
  organization_id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  modality: string | null;
  logo_url: string | null;
  role: string;
  can_manage: boolean;
  arena_enabled: boolean;
  discoverable: boolean;
};

export type ArenaSession = {
  user_id: string;
  user_name: string;
  user_email: string;
  teams: ArenaTeamSummary[];
  selected_organization_id: string | null;
  selected_role: string | null;
  can_manage_selected: boolean;
  gestao_url: string;
};

export type ChallengeContextState =
  | "pending"
  | "awaiting_reconfirmation"
  | "accepted"
  | string;

/**
 * Lightweight hint about an existing challenge tied to an explored
 * availability, so the Explorar page can nudge the user without hiding the
 * opportunity or the opposing team.
 */
export type ChallengeContext = {
  state: ChallengeContextState;
  challenge_id: string | null;
  proposed_date: string | null;
  proposed_time: string | null;
  direction: "sent" | "received" | string | null;
};

export type AvailabilityItem = {
  id: string;
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  logo_url: string | null;
  modality: string;
  city: string | null;
  region: string | null;
  available_from: string;
  available_until: string | null;
  preferred_period: string;
  venue_option: string;
  venue_description: string | null;
  notes: string | null;
  expires_at: string;
  created_at: string;
  status?: string;
  version?: number;
  challenge_context?: ChallengeContext | null;
};

export type ChallengeItem = {
  id: string;
  availability_id: string | null;
  sender_organization_id: string;
  sender_organization_name: string;
  sender_logo_url: string | null;
  recipient_organization_id: string;
  recipient_organization_name: string;
  recipient_logo_url: string | null;
  proposed_date: string;
  proposed_time: string | null;
  venue_option: string;
  venue_description: string | null;
  message: string | null;
  contact_phone: string | null;
  status: string;
  created_by: string;
  responded_by: string | null;
  responded_at: string | null;
  expires_at: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  direction: "sent" | "received" | string;
  schedule_conflict_hint: boolean;
  pending_proposed_date: string | null;
  pending_proposed_time: string | null;
  pending_venue_option: string | null;
  pending_venue_description: string | null;
};

export type ChallengeCommentItem = {
  id: string;
  challenge_id: string;
  author_user_id: string;
  author_organization_id: string;
  author_organization_name: string;
  body: string;
  created_at: string;
};

export type ArenaNotificationItem = {
  id: string;
  organization_id: string;
  challenge_id: string | null;
  kind: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type NextMatchItem = {
  challenge_id: string;
  proposed_date: string;
  proposed_time: string | null;
  venue_option: string;
  venue_description: string | null;
  status: string;
  opponent_organization_id: string;
  opponent_organization_name: string;
  opponent_logo_url: string | null;
  own_organization_id: string;
  own_organization_name: string;
  own_logo_url: string | null;
  direction: "sent" | "received" | string;
};

export type TeamSettings = {
  organization_id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  modality: string | null;
  logo_url: string | null;
  arena_enabled: boolean;
  discoverable: boolean;
  public_city: boolean;
  public_roster: boolean;
  public_stats: boolean;
  public_description: string | null;
  can_manage: boolean;
};

export type FilterOptionsResponse = {
  cities: string[];
  states: string[];
  modalities?: string[];
};

export type ArenaFeedbackType =
  | "suggestion"
  | "improvement"
  | "problem"
  | "compliment";

export type CreateFeedbackPayload = {
  feedback_type: ArenaFeedbackType;
  subject: string;
  body: string;
  organization_id?: string;
};

export type TeamReputation = {
  organization_id: string;
  reputation_building: boolean;
  ratings_count: number;
  avg_overall: number | null;
  avg_punctuality: number | null;
  avg_organization: number | null;
  avg_fair_play: number | null;
  avg_communication: number | null;
  no_show_rate: number | null;
  matches_played_count: number;
  badges: string[];
};

export type RatingEligibility = {
  eligible: boolean;
  reason?: string | null;
  already_rated?: boolean;
};

export type CreateRatingPayload = {
  match_happened: boolean;
  overall: number;
  punctuality: number;
  organization_score: number;
  fair_play: number;
  communication: number;
  private_comment?: string;
};

export type RatingItem = {
  id: string;
  challenge_id: string;
  organization_id: string;
  rated_organization_id: string;
  match_happened: boolean;
  overall: number;
  punctuality: number;
  organization_score: number;
  fair_play: number;
  communication: number;
  private_comment: string | null;
  status: string;
  created_at: string;
};

export type CreateDisputePayload = {
  reason: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
};

export type PaginatedNotifications = Paginated<ArenaNotificationItem> & {
  unread_count: number;
};

export type ApiFieldError = {
  field?: string;
  message?: string;
};

export type ApiSuccess<T> = {
  success: boolean;
  message: string;
  data?: T;
  error_code?: string;
  errors?: ApiFieldError[];
};
