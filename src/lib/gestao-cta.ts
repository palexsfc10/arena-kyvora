/**
 * Build Gestão CTA URLs from the centralized public base URL.
 * Never embed HML/prod/localhost literals at call sites.
 * Never embed access tokens or PII — identity handoff uses the shared
 * refresh cookie + `kyvora_entry=arena_session` marker consumed by Gestão.
 */

export const GESTAO_CTA_UTM = {
  source: "arena",
  medium: "referral",
  campaign: "arena_authenticated_header",
  content: "authenticated_header",
} as const;

/** Marker consumed by Kyvora Gestão to discard a stale localStorage session. */
export const GESTAO_SESSION_ENTRY_PARAM = "kyvora_entry";
export const GESTAO_SESSION_ENTRY_VALUE = "arena_session";

export type GestaoUtmOptions = {
  content?: string;
  medium?: string;
  campaign?: string;
  /**
   * When true (default for this builder), append the Arena session-entry marker
   * so Gestão prefers the shared refresh cookie over a prior localStorage user.
   */
  sessionHandoff?: boolean;
};

export function buildGestaoManagementUrl(
  gestaoBaseUrl: string,
  contentOrOptions: string | GestaoUtmOptions = GESTAO_CTA_UTM.content,
): string | null {
  const base = gestaoBaseUrl.trim();
  if (!base) return null;

  const opts: GestaoUtmOptions =
    typeof contentOrOptions === "string"
      ? { content: contentOrOptions }
      : contentOrOptions;

  try {
    const url = new URL(base);
    url.searchParams.set("utm_source", GESTAO_CTA_UTM.source);
    url.searchParams.set("utm_medium", opts.medium ?? GESTAO_CTA_UTM.medium);
    url.searchParams.set(
      "utm_campaign",
      opts.campaign ?? GESTAO_CTA_UTM.campaign,
    );
    url.searchParams.set(
      "utm_content",
      opts.content ?? GESTAO_CTA_UTM.content,
    );
    if (opts.sessionHandoff !== false) {
      url.searchParams.set(
        GESTAO_SESSION_ENTRY_PARAM,
        GESTAO_SESSION_ENTRY_VALUE,
      );
    }
    return url.toString();
  } catch {
    return null;
  }
}

/** Public destination label for analytics (no query string). */
export function gestaoDestinationLabel(gestaoBaseUrl: string): string {
  try {
    return new URL(gestaoBaseUrl.trim()).hostname || "gestao";
  } catch {
    return "gestao";
  }
}
