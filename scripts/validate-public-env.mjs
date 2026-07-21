#!/usr/bin/env node
/**
 * Fail-fast for Docker / CI image builds that bake NEXT_PUBLIC_* into the bundle.
 * Local `next dev` does not need this script.
 */

const site = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
const api = (process.env.NEXT_PUBLIC_KYVORA_API_BASE_URL || "").trim();
const gestao = (process.env.NEXT_PUBLIC_GESTAO_URL || "").trim();

function fail(message) {
  console.error(`[validate-public-env] ${message}`);
  process.exit(1);
}

function isLocalhost(url) {
  return /localhost|127\.0\.0\.1/i.test(url);
}

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

if (!site || !api || !gestao) {
  fail(
    "NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_KYVORA_API_BASE_URL and NEXT_PUBLIC_GESTAO_URL are required for image builds.",
  );
}

if (isLocalhost(site) || isLocalhost(api) || isLocalhost(gestao)) {
  fail(
    "Image builds must not bake localhost/127.0.0.1 into NEXT_PUBLIC_* (got local URL).",
  );
}

const siteHost = hostOf(site);
const apiHost = hostOf(api);
const gestaoHost = hostOf(gestao);

if (siteHost === "hml-arena.kyvoraapp.com.br") {
  if (apiHost !== "hml-api.kyvoraapp.com.br") {
    fail(
      `HML Arena requires NEXT_PUBLIC_KYVORA_API_BASE_URL host hml-api.kyvoraapp.com.br (got ${apiHost || api}).`,
    );
  }
  if (gestaoHost !== "hml.kyvoraapp.com.br") {
    fail(
      `HML Arena requires NEXT_PUBLIC_GESTAO_URL host hml.kyvoraapp.com.br (got ${gestaoHost || gestao}).`,
    );
  }
}

if (apiHost === "api.kyvoraapp.com.br" && siteHost.includes("hml-")) {
  fail("HML site must not use production API host api.kyvoraapp.com.br.");
}

if (gestaoHost === "app.kyvoraapp.com.br" && siteHost.includes("hml-")) {
  fail("HML site must not use production Gestão host app.kyvoraapp.com.br.");
}

// Guard against accidentally baking secrets into public env names.
for (const [key, value] of Object.entries(process.env)) {
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

console.log("[validate-public-env] OK", {
  site,
  api,
  gestao,
});
