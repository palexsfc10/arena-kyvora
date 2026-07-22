/**
 * Build Gestão CTA URLs from the centralized public base URL.
 * Never embed HML/prod/localhost literals at call sites.
 */

export const GESTAO_CTA_UTM = {
  source: "arena",
  medium: "referral",
  campaign: "arena_authenticated_header",
  content: "authenticated_header",
} as const;

export type GestaoUtmOptions = {
  content?: string;
  medium?: string;
  campaign?: string;
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
