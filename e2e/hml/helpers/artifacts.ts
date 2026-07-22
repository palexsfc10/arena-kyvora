import fs from "node:fs";
import path from "node:path";
import { Page } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
export const isHml = /hml-arena\.kyvoraapp\.com\.br/i.test(baseURL);
export const envName = isHml ? "hml" : "local";
export const artifactRoot = path.join(
  process.cwd(),
  "artifacts",
  "playwright",
  envName,
);

export const paths = {
  screenshots: path.join(artifactRoot, "screenshots"),
  videos: path.join(artifactRoot, "videos"),
  traces: path.join(artifactRoot, "traces"),
  reports: path.join(artifactRoot, "reports"),
  testData: path.join(artifactRoot, "test-data"),
  social: path.join(artifactRoot, "social-candidates"),
};

export function ensureArtifactDirs(): void {
  for (const dir of Object.values(paths)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  for (const folder of [
    "01-publico",
    "02-cadastro",
    "03-onboarding",
    "04-meu-time",
    "05-explorar",
    "06-desafios",
    "07-avaliacoes",
    "08-feedback",
    "09-admin",
    "10-mobile",
  ]) {
    fs.mkdirSync(path.join(paths.screenshots, folder), { recursive: true });
  }
}

export async function shot(
  page: Page,
  folder: string,
  filename: string,
): Promise<string> {
  ensureArtifactDirs();
  const dest = path.join(paths.screenshots, folder, filename);
  await page.screenshot({ path: dest, fullPage: true });
  return dest;
}

export async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  return errors;
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  const visible = user.slice(0, Math.min(3, user.length));
  return `${visible}***@${domain}`;
}

export function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}

export function dayAfterTomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().slice(0, 10);
}
