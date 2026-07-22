/**
 * BEFORE-fix reproduction: NotificationsPanel overflow on mobile (HML).
 * Do not change product code before this script documents the bug.
 *
 * Run:
 *   PLAYWRIGHT_BASE_URL=https://hml-arena.kyvoraapp.com.br npx playwright test e2e/hml/notifications/repro-before.spec.ts --project=chromium-desktop
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { requireE2ePassword } from "../helpers/demoUsers";

const API = process.env.PLAYWRIGHT_API_BASE_URL ?? "https://hml-api.kyvoraapp.com.br";
const ACCESS_TOKEN_KEY = "arena_kyvora_access_token";
const OUT = path.join(
  process.cwd(),
  "artifacts",
  "playwright",
  "hml",
  "notifications",
  "before",
);

type Viewport = { name: string; width: number; height: number };

const VIEWPORTS: Viewport[] = [
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "mobile-375x667", width: 375, height: 667 },
  { name: "mobile-360x800", width: 360, height: 800 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "notebook-1280x720", width: 1280, height: 720 },
  { name: "desktop-1440x900", width: 1440, height: 900 },
];

type OverflowReport = {
  viewport: string;
  panel: {
    x: number;
    y: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
  } | null;
  viewportSize: { width: number; height: number };
  overflowLeft: number;
  overflowRight: number;
  overflowTop: number;
  overflowBottom: number;
  pageHorizontalOverflow: boolean;
  withinViewport: boolean;
};

async function bootstrapAuth(page: Page): Promise<void> {
  const stamp = Date.now();
  const email = `qa.notif.repro.${stamp}@example.com`;
  const password = requireE2ePassword();

  const reg = await fetch(`${API}/api/v1/arena/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      name: "QA Notif Repro",
      email,
      password,
      confirm_password: password,
      accept_terms: true,
    }),
  });
  expect(reg.status, `register ${reg.status}`).toBe(201);

  const login = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  expect(login.status).toBe(200);
  const loginJson = (await login.json()) as { data?: { access_token?: string } };
  const token = loginJson.data?.access_token;
  expect(token).toBeTruthy();

  const team = await fetch(`${API}/api/v1/arena/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: `Time Notif ${stamp}`,
      modality: "futsal",
      city: "São Paulo",
      state: "SP",
      public_description: "Time de reprodução de bug de notificações",
      participate_in_arena: true,
      discoverable: true,
      public_city: true,
      idempotency_key: `qa-notif-repro-${stamp}`,
    }),
  });
  const teamText = await team.text();
  expect(team.status, `create team ${team.status} ${teamText}`).toBeLessThan(300);

  // Prefer refreshed token from create-team response when present.
  let sessionToken = token!;
  try {
    const teamJson = JSON.parse(teamText) as {
      data?: { access_token?: string };
    };
    if (teamJson.data?.access_token) sessionToken = teamJson.data.access_token;
  } catch {
    // keep login token
  }

  await page.addInitScript(
    ([key, value]) => {
      sessionStorage.setItem(key, value);
    },
    [ACCESS_TOKEN_KEY, sessionToken] as [string, string],
  );
}

async function measurePanel(page: Page, label: string): Promise<OverflowReport> {
  const viewport = page.viewportSize()!;
  const panel = page.getByRole("dialog", { name: /avisos/i });
  await expect(panel).toBeVisible();
  const box = await panel.boundingBox();
  const pageHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  });

  const report: OverflowReport = {
    viewport: label,
    panel: box
      ? {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          right: box.x + box.width,
          bottom: box.y + box.height,
        }
      : null,
    viewportSize: viewport,
    overflowLeft: box ? Math.max(0, -box.x) : -1,
    overflowRight: box ? Math.max(0, box.x + box.width - viewport.width) : -1,
    overflowTop: box ? Math.max(0, -box.y) : -1,
    overflowBottom: box ? Math.max(0, box.y + box.height - viewport.height) : -1,
    pageHorizontalOverflow,
    withinViewport: false,
  };

  report.withinViewport = Boolean(
    box &&
      box.x >= -0.5 &&
      box.y >= -0.5 &&
      box.x + box.width <= viewport.width + 0.5 &&
      !pageHorizontalOverflow,
  );

  return report;
}

test.describe("REPRO BEFORE — notifications overflow", () => {
  test.beforeAll(() => {
    fs.mkdirSync(OUT, { recursive: true });
  });

  for (const vp of VIEWPORTS) {
    test(`document panel geometry @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await bootstrapAuth(page);
      await page.goto("/app/explorar");
      await expect(page.getByRole("button", { name: /avisos/i })).toBeVisible({
        timeout: 20_000,
      });

      await page.getByRole("button", { name: /avisos/i }).click();
      const report = await measurePanel(page, vp.name);

      const shotPath = path.join(OUT, `${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });

      const jsonPath = path.join(OUT, `${vp.name}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");

      // Intentionally soft-assert for documentation: we EXPECT mobile failures
      // before the fix. Still fail the suite if measurement itself is broken.
      expect(report.panel, "panel bounding box missing").not.toBeNull();

      // Attach summary for the HTML report
      await test.info().attach(`geometry-${vp.name}`, {
        body: JSON.stringify(report, null, 2),
        contentType: "application/json",
      });

      if (vp.width <= 430) {
        // Document known bug: do not force-pass. Record whether overflow exists.
        console.log(
          `[BEFORE] ${vp.name} withinViewport=${report.withinViewport} overflowLeft=${report.overflowLeft.toFixed(1)} overflowRight=${report.overflowRight.toFixed(1)} pageHOverflow=${report.pageHorizontalOverflow}`,
        );
      }
    });
  }
});
