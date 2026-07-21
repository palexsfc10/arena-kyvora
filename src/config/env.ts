/**
 * Public runtime configuration.
 * Only NEXT_PUBLIC_* values are exposed to the browser.
 * Never put secrets or private API credentials here.
 */

function readPublic(name: string, fallback = ""): string {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

export const env = {
  siteUrl: readPublic("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
  siteName: readPublic("NEXT_PUBLIC_SITE_NAME", "Arena Kyvora"),
  gestaoUrl: readPublic(
    "NEXT_PUBLIC_GESTAO_URL",
    "https://app.kyvoraapp.com.br",
  ),
  waitlistUrl: readPublic("NEXT_PUBLIC_WAITLIST_URL"),
  contactEmail: readPublic("NEXT_PUBLIC_CONTACT_EMAIL", "contato@kyvoraapp.com.br"),
  googleAnalyticsId: readPublic("NEXT_PUBLIC_GA_MEASUREMENT_ID"),
  metaPixelId: readPublic("NEXT_PUBLIC_META_PIXEL_ID"),
  enableAnalytics: readPublic("NEXT_PUBLIC_ENABLE_ANALYTICS", "false") === "true",
} as const;

export type PublicEnv = typeof env;
