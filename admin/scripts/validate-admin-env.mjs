#!/usr/bin/env node
/**
 * Fail-fast for Arena Admin Vite image builds (VITE_* baked into the bundle).
 */

const api = (process.env.VITE_API_BASE_URL || "").trim();
const appEnv = (process.env.VITE_APP_ENV || "").trim().toLowerCase();

function fail(message) {
  console.error(`[validate-admin-env] ${message}`);
  process.exit(1);
}

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

if (!api) {
  fail("VITE_API_BASE_URL is required for Admin image builds.");
}

let parsed;
try {
  parsed = new URL(api);
} catch {
  fail(`VITE_API_BASE_URL must be an absolute URL; got "${api}"`);
}

if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
  fail(`VITE_API_BASE_URL must be http(s); got ${parsed.protocol}`);
}

if (/localhost|127\.0\.0\.1/i.test(api) && appEnv !== "development") {
  fail("Non-development Admin images must not bake localhost into VITE_API_BASE_URL.");
}

const apiHost = hostOf(api);
const isHml =
  appEnv === "staging" ||
  appEnv === "hml" ||
  apiHost.includes("hml-") ||
  apiHost.startsWith("hml.");

if (isHml && apiHost === "api.kyvoraapp.com.br") {
  fail("HML/staging Admin must not use production API host api.kyvoraapp.com.br.");
}

if (appEnv === "staging" || appEnv === "hml") {
  if (apiHost !== "hml-api.kyvoraapp.com.br") {
    fail(
      `HML Admin requires VITE_API_BASE_URL host hml-api.kyvoraapp.com.br (got ${apiHost || api}).`,
    );
  }
}

for (const [key, value] of Object.entries(process.env)) {
  if (!key.startsWith("VITE_")) continue;
  const lower = `${key}=${value || ""}`.toLowerCase();
  if (
    /password|secret|private_key|api_key|token=|database_url|smtp_pass/.test(
      lower,
    )
  ) {
    fail(`Refusing suspicious VITE_* key that looks like a secret: ${key}`);
  }
}

console.log("[validate-admin-env] OK", { api, appEnv: appEnv || "(unset)" });
