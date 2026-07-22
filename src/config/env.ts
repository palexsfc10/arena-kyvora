/**
 * Public runtime configuration.
 * Only NEXT_PUBLIC_* values are exposed to the browser.
 * Never put secrets or private API credentials here.
 *
 * IMPORTANT: Next.js inlines `process.env.NEXT_PUBLIC_*` only when the key is a
 * string literal. Dynamic access like `process.env[name]` is not replaced at
 * build time and silently falls back — never use it for public env.
 *
 * Localhost defaults are gated on NODE_ENV === "development" so production /
 * HML `next build` can DCE them out of the client bundle.
 *
 * Deployable builds (Docker / CI image) MUST pass SITE_URL, GESTAO_URL and
 * KYVORA_API_BASE_URL via build args — see scripts/validate-public-env.mjs.
 */

function readPublic(value: string | undefined, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

const isDev = process.env.NODE_ENV === "development";

export const env = {
  siteUrl: readPublic(
    process.env.NEXT_PUBLIC_SITE_URL,
    isDev ? "http://localhost:3000" : "",
  ),
  siteName: readPublic(process.env.NEXT_PUBLIC_SITE_NAME, "Arena Kyvora"),
  gestaoUrl: readPublic(
    process.env.NEXT_PUBLIC_GESTAO_URL,
    isDev ? "http://localhost:5173" : "",
  ),
  apiBaseUrl: readPublic(
    process.env.NEXT_PUBLIC_KYVORA_API_BASE_URL,
    isDev ? "http://localhost:8000" : "",
  ),
  waitlistUrl: readPublic(process.env.NEXT_PUBLIC_WAITLIST_URL),
  contactEmail: readPublic(
    process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    "contato@kyvoraapp.com.br",
  ),
  googleAnalyticsId: readPublic(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
  metaPixelId: readPublic(process.env.NEXT_PUBLIC_META_PIXEL_ID),
  enableAnalytics:
    readPublic(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS, "false") === "true",
  /**
   * Production indexing must be explicitly enabled.
   * HML and unset builds stay noindex (safe default for homologation).
   */
  allowIndexing:
    readPublic(process.env.NEXT_PUBLIC_ALLOW_INDEXING, "false") === "true",
} as const;

export type PublicEnv = typeof env;

/** True when Gestão base URL is a usable absolute http(s) URL. */
export function hasGestaoUrl(url: string = env.gestaoUrl): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Resolve metadataBase without calling `new URL("")`.
 * Deployable builds must set NEXT_PUBLIC_SITE_URL (validated at image build).
 */
export function resolveMetadataBaseUrl(): URL {
  const raw = env.siteUrl.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      throw new Error(
        `Invalid NEXT_PUBLIC_SITE_URL "${raw}". Expected an absolute http(s) URL baked at build time.`,
      );
    }
  }
  if (isDev) {
    return new URL("http://localhost:3000");
  }
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is required for non-development builds. Public env is inlined into the client bundle at build time — pass it as a Docker/CI build arg.",
  );
}
