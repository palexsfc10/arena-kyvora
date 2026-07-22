import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { apiBase, DemoUser, requireE2ePassword } from "./demoUsers";
import { maskEmail, paths, ensureArtifactDirs } from "./artifacts";

type RegisterResult = {
  email: string;
  verification_required?: boolean;
};

async function apiJson<T>(
  urlPath: string,
  init: RequestInit = {},
): Promise<{ status: number; body: T }> {
  const res = await fetch(`${apiBase}${urlPath}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body = {} as T;
  try {
    body = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    body = { raw: text } as T;
  }
  return { status: res.status, body };
}

/**
 * Marks a HML user as email-verified via Jarvis DB.
 * Does not disable verification permanently — only stamps demo accounts.
 */
export function verifyEmailInHmlDb(email: string): void {
  const key = process.env.ARENA_HML_SSH_KEY ?? `${process.env.USERPROFILE}\\.ssh\\id_ed25519_jarvis`;
  const host = process.env.ARENA_HML_SSH_HOST ?? "palex@10.0.0.211";
  const sql = `UPDATE users SET email_verified_at = NOW(), email_verification_token_hash = NULL WHERE email = '${email.replace(/'/g, "''")}';`;
  const remote = [
    "cd /home/palex/ntws/kyvora-hml-clean/deploy/hml &&",
    "docker compose -p kyvora-hml --env-file .env.hml -f compose.hml.yaml exec -T hml-db",
    `psql -U kyvora_hml -d kyvora_hml -c "${sql}"`,
  ].join(" ");

  execFileSync(
    "ssh",
    [
      "-o",
      "BatchMode=yes",
      "-o",
      "IdentitiesOnly=yes",
      "-i",
      key,
      "-o",
      "ConnectTimeout=30",
      host,
      remote,
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
}

async function apiJsonWithRetry<T>(
  urlPath: string,
  init: RequestInit = {},
  attempts = 5,
): Promise<{ status: number; body: T }> {
  let last = await apiJson<T>(urlPath, init);
  for (let i = 1; i < attempts && last.status === 429; i += 1) {
    await new Promise((r) => setTimeout(r, 15_000 * i));
    last = await apiJson<T>(urlPath, init);
  }
  return last;
}

export async function ensureDemoAccount(user: DemoUser): Promise<{
  created: boolean;
  verified: boolean;
  maskedEmail: string;
}> {
  const password = requireE2ePassword();
  ensureArtifactDirs();

  // Prefer login-first when reusing known demo emails (avoids register rate limits).
  const existingLogin = await apiJsonWithRetry<{
    success?: boolean;
    data?: { access_token?: string };
  }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: user.email, password }),
  });
  if (existingLogin.status === 200 && existingLogin.body?.data?.access_token) {
    return {
      created: false,
      verified: true,
      maskedEmail: maskEmail(user.email),
    };
  }

  const register = await apiJsonWithRetry<{
    success?: boolean;
    data?: RegisterResult;
    message?: string;
    error_code?: string;
  }>("/api/v1/arena/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: user.name,
      email: user.email,
      password,
      confirm_password: password,
      accept_terms: true,
    }),
  });

  let created = register.status === 201 || register.status === 200;
  if (register.status === 409 || register.status === 429) {
    created = false;
  } else if (register.status >= 400) {
    throw new Error(
      `Falha ao registrar ${maskEmail(user.email)}: HTTP ${register.status} ${JSON.stringify(register.body)}`,
    );
  }

  if (created || register.status === 409) {
    try {
      verifyEmailInHmlDb(user.email);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      fs.appendFileSync(
        path.join(paths.testData, "verify-errors.log"),
        `${new Date().toISOString()} ${maskEmail(user.email)} ${msg}\n`,
      );
    }
  }

  const login = await apiJsonWithRetry<{
    success?: boolean;
    data?: { access_token?: string };
  }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: user.email, password }),
  });

  if (login.status !== 200 || !login.body?.data?.access_token) {
    // Last resort: accounts may already exist; UI login will be attempted by the spec.
    return {
      created,
      verified: false,
      maskedEmail: maskEmail(user.email),
    };
  }

  return {
    created,
    verified: true,
    maskedEmail: maskEmail(user.email),
  };
}

export async function loginViaApi(email: string): Promise<string> {
  const password = requireE2ePassword();
  const login = await apiJsonWithRetry<{ data?: { access_token?: string } }>(
    "/api/v1/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  );
  const token = login.body?.data?.access_token;
  if (!token) {
    throw new Error(`API login failed for ${maskEmail(email)} (${login.status})`);
  }
  return token;
}
