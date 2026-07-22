/**
 * Fail-fast for Docker / CI image builds that bake NEXT_PUBLIC_* into the bundle.
 * Local `next dev` does not need this script.
 *
 * Exported `validatePublicEnv` is covered by unit tests; CLI exits non-zero on failure.
 */

const HML_SITE = "hml-arena.kyvoraapp.com.br";
const HML_API = "hml-api.kyvoraapp.com.br";
const HML_GESTAO = "hml.kyvoraapp.com.br";
const PRD_SITE = "arena.kyvoraapp.com.br";
const PRD_API = "api.kyvoraapp.com.br";
const PRD_GESTAO = "app.kyvoraapp.com.br";

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ site: string, api: string, gestao: string, allowIndexing: boolean, enableAnalytics: boolean }}
 */
export function validatePublicEnv(env = process.env) {
  const site = (env.NEXT_PUBLIC_SITE_URL || "").trim();
  const api = (env.NEXT_PUBLIC_KYVORA_API_BASE_URL || "").trim();
  const gestao = (env.NEXT_PUBLIC_GESTAO_URL || "").trim();
  const allowIndexing = requireExplicitBool(
    "NEXT_PUBLIC_ALLOW_INDEXING",
    env.NEXT_PUBLIC_ALLOW_INDEXING,
  );
  const enableAnalytics = requireExplicitBool(
    "NEXT_PUBLIC_ENABLE_ANALYTICS",
    env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  );
  const gaId = (env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "").trim();
  const metaId = (env.NEXT_PUBLIC_META_PIXEL_ID || "").trim();

  if (!site || !api || !gestao) {
    fail(
      "NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_KYVORA_API_BASE_URL and NEXT_PUBLIC_GESTAO_URL are required for image builds (Gestão link is mandatory in HML/prod).",
    );
  }

  assertAbsoluteHttp("NEXT_PUBLIC_SITE_URL", site);
  assertAbsoluteHttp("NEXT_PUBLIC_KYVORA_API_BASE_URL", api);
  assertAbsoluteHttp("NEXT_PUBLIC_GESTAO_URL", gestao);

  if (isLocalhost(site) || isLocalhost(api) || isLocalhost(gestao)) {
    fail(
      "Image builds must not bake localhost/127.0.0.1 into NEXT_PUBLIC_* (got local URL).",
    );
  }

  const siteHost = hostOf(site);
  const apiHost = hostOf(api);
  const gestaoHost = hostOf(gestao);
  const isHmlSite = siteHost === HML_SITE || siteHost.includes("hml-") || siteHost.startsWith("hml.");
  const isPrdSite = siteHost === PRD_SITE;

  if (siteHost === HML_SITE) {
    if (apiHost !== HML_API) {
      fail(
        `HML Arena requires NEXT_PUBLIC_KYVORA_API_BASE_URL host ${HML_API} (got ${apiHost || api}).`,
      );
    }
    if (gestaoHost !== HML_GESTAO) {
      fail(
        `HML Arena requires NEXT_PUBLIC_GESTAO_URL host ${HML_GESTAO} (got ${gestaoHost || gestao}).`,
      );
    }
  }

  if (isPrdSite) {
    if (apiHost !== PRD_API) {
      fail(
        `Production Arena requires NEXT_PUBLIC_KYVORA_API_BASE_URL host ${PRD_API} (got ${apiHost || api}).`,
      );
    }
    if (gestaoHost !== PRD_GESTAO) {
      fail(
        `Production Arena requires NEXT_PUBLIC_GESTAO_URL host ${PRD_GESTAO} (got ${gestaoHost || gestao}).`,
      );
    }
  }

  if (isPrdSite && (isHmlHost(apiHost) || isHmlHost(gestaoHost))) {
    fail("Production site must not use HML API or Gestão hosts.");
  }

  if (isHmlSite && (apiHost === PRD_API || gestaoHost === PRD_GESTAO)) {
    fail("HML site must not use production API or Gestão hosts.");
  }

  if (apiHost === PRD_API && isHmlSite) {
    fail(`HML site must not use production API host ${PRD_API}.`);
  }

  if (gestaoHost === PRD_GESTAO && isHmlSite) {
    fail(`HML site must not use production Gestão host ${PRD_GESTAO}.`);
  }

  if (isHmlSite && allowIndexing) {
    fail(
      "HML builds must keep NEXT_PUBLIC_ALLOW_INDEXING=false (got true). Indexing is only for authorized production go-live.",
    );
  }

  if (enableAnalytics && !gaId && !metaId) {
    fail(
      "NEXT_PUBLIC_ENABLE_ANALYTICS=true requires NEXT_PUBLIC_GA_MEASUREMENT_ID and/or NEXT_PUBLIC_META_PIXEL_ID.",
    );
  }

  // Guard against accidentally baking secrets into public env names.
  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith("NEXT_PUBLIC_")) continue;
    const lower = `${key}=${value || ""}`.toLowerCase();
    if (
      /password|secret|private_key|api_key|token=|database_url|smtp_pass/.test(
        lower,
      )
    ) {
      fail(`Refusing suspicious NEXT_PUBLIC_* key that looks like a secret: ${key}`);
    }
  }

  return { site, api, gestao, allowIndexing, enableAnalytics };
}

function fail(message) {
  const err = new Error(message);
  err.name = "ValidatePublicEnvError";
  throw err;
}

function requireExplicitBool(name, raw) {
  const value = (raw || "").trim().toLowerCase();
  if (value !== "true" && value !== "false") {
    fail(
      `${name} must be explicitly set to "true" or "false" for image builds (got "${raw ?? ""}").`,
    );
  }
  return value === "true";
}

function isLocalhost(url) {
  return /localhost|127\.0\.0\.1/i.test(url);
}

function isHmlHost(hostname) {
  return hostname.includes("hml-") || hostname.startsWith("hml.");
}

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function assertAbsoluteHttp(name, url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      fail(`${name} must be http(s); got ${parsed.protocol}`);
    }
  } catch (err) {
    if (err && err.name === "ValidatePublicEnvError") throw err;
    fail(`${name} must be an absolute URL; got "${url}"`);
  }
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return /validate-public-env\.mjs$/.test(entry.replace(/\\/g, "/"));
}

if (isDirectRun()) {
  try {
    const result = validatePublicEnv(process.env);
    console.log("[validate-public-env] OK", result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[validate-public-env] ${message}`);
    process.exit(1);
  }
}
