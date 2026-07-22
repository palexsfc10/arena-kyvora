/**
 * HML demo identity helpers.
 * Passwords come from ARENA_E2E_PASSWORD (never hardcode).
 */

export type DemoUser = {
  key: "a" | "b";
  name: string;
  email: string;
  teamName: string;
  city: string;
  state: string;
  modality: "futsal";
};

const stamp = process.env.ARENA_E2E_STAMP ?? new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);

export function requireE2ePassword(): string {
  const password = process.env.ARENA_E2E_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error(
      "Defina ARENA_E2E_PASSWORD (mín. 8 chars) para executar fluxos autenticados em HML.",
    );
  }
  return password;
}

export function demoUsers(): { a: DemoUser; b: DemoUser } {
  const emailA =
    process.env.ARENA_E2E_USER_A_EMAIL ??
    `arena.demo.osasco.${stamp}@example.com`;
  const emailB =
    process.env.ARENA_E2E_USER_B_EMAIL ??
    `arena.demo.oeste.${stamp}@example.com`;

  return {
    a: {
      key: "a",
      name: "Gestor Demo Osasco",
      email: emailA,
      teamName: "Arena Demo Osasco",
      city: "Osasco",
      state: "SP",
      modality: "futsal",
    },
    b: {
      key: "b",
      name: "Gestor Demo Oeste",
      email: emailB,
      teamName: "Futsal Demo Oeste",
      city: "Osasco",
      state: "SP",
      modality: "futsal",
    },
  };
}

export const apiBase =
  process.env.PLAYWRIGHT_API_BASE_URL ?? "https://hml-api.kyvoraapp.com.br";
