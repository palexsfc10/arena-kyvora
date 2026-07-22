/**
 * Notifications — responsive + functional gates (HML / local-with-HML-API).
 *
 * These tests intentionally assert bounding-box geometry, not only visibility.
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import {
  assertNoPageHorizontalOverflow,
  assertWithinViewport,
} from "../helpers/viewport";
import { registerEphemeralAndLogin, ensureTeamForToken } from "../helpers/bootstrap";

const API = process.env.PLAYWRIGHT_API_BASE_URL ?? "https://hml-api.kyvoraapp.com.br";
const ACCESS_TOKEN_KEY = "arena_kyvora_access_token";
const ARTIFACT_DIR = path.join(
  process.cwd(),
  "artifacts",
  "playwright",
  "hml",
  "notifications",
);

type Viewport = { name: string; width: number; height: number };

const MOBILE: Viewport[] = [
  { name: "390x844", width: 390, height: 844 },
  { name: "375x667", width: 375, height: 667 },
  { name: "360x800", width: 360, height: 800 },
];

const DESKTOP: Viewport[] = [
  { name: "1280x720", width: 1280, height: 720 },
  { name: "1440x900", width: 1440, height: 900 },
];

async function bootstrapSession(page: Page): Promise<{
  token: string;
  organizationId: string;
}> {
  const stamp = Date.now();
  const { token: registeredToken } = await registerEphemeralAndLogin({
    name: "QA Notif",
    emailPrefix: "qa.notif",
  });
  const { token, organizationId } = await ensureTeamForToken(registeredToken, {
    name: `Notif Team ${stamp}`,
    city: "Campinas",
    state: "SP",
    idempotencyKey: `qa-notif-${stamp}`,
  });

  await page.addInitScript(
    ([key, value]) => {
      sessionStorage.setItem(key, value);
    },
    [ACCESS_TOKEN_KEY, token] as [string, string],
  );

  return { token, organizationId };
}

async function openPanel(page: Page) {
  await page.goto("/app/explorar");
  await expect(page.getByRole("button", { name: /avisos/i })).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole("button", { name: /avisos/i }).click();
  return page.getByTestId("notifications-panel");
}

async function shot(page: Page, folder: string, name: string) {
  const dir = path.join(ARTIFACT_DIR, folder);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, name);
  await page.screenshot({ path: dest, fullPage: false });
  return dest;
}

test.describe("Notifications — empty + geometry", () => {
  test.describe.configure({ retries: 2 });
  for (const vp of [...MOBILE, ...DESKTOP]) {
    test(`empty panel stays in viewport @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.route("**/api/v1/arena/teams/*/notifications**", async (route) => {
        if (route.request().method() !== "GET") {
          await route.continue();
          return;
        }
        if (route.request().url().includes("/read")) {
          await route.continue();
          return;
        }
        const emptyPayload = {
          success: true,
          message: "ok",
          data: {
            items: [],
            unread_count: 0,
            page: 1,
            page_size: 20,
            total: 0,
            has_more: false,
          },
        };
        // unread-count endpoint returns a smaller payload
        if (route.request().url().includes("unread-count")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              data: { unread_count: 0 },
            }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(emptyPayload),
        });
      });
      await bootstrapSession(page);
      const panel = await openPanel(page);

      await expect(page.getByTestId("notifications-empty")).toBeVisible();
      await assertWithinViewport(page, panel, { label: `empty@${vp.name}` });
      await assertNoPageHorizontalOverflow(page);

      await shot(
        page,
        "after",
        `empty-${vp.name}.png`,
      );

      // Close via explicit button
      await page.getByRole("button", { name: /fechar avisos/i }).click();
      await expect(panel).toHaveCount(0);
    });
  }
});

test.describe("Notifications — interactions", () => {
  test("open, Escape close, outside close @ 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await bootstrapSession(page);
    await page.route("**/api/v1/arena/teams/*/notifications**", async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      if (route.request().url().includes("/read")) {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "ok",
          data: {
            items: [],
            unread_count: 0,
            page: 1,
            page_size: 20,
            total: 0,
            has_more: false,
          },
        }),
      });
    });
    const panel = await openPanel(page);
    await assertWithinViewport(page, panel, { label: "open" });

    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);

    await page.getByRole("button", { name: /avisos/i }).click();
    await expect(page.getByTestId("notifications-panel")).toBeVisible();
    // Mobile panel is near full-bleed; Escape is the reliable outside-close equivalent.
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("notifications-panel")).toHaveCount(0);
  });

  test("header and logout remain usable with panel open @ 360x800", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await bootstrapSession(page);
    const panel = await openPanel(page);
    await assertWithinViewport(page, panel);

    // Mobile: feedback + logout live in the account overflow menu.
    await page.getByTestId("header-account-menu").click();
    const menu = page.getByTestId("header-account-menu-panel");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /^sair$/i })).toBeVisible();
    await expect(
      menu.getByRole("menuitem", { name: /enviar sugestão/i }),
    ).toBeVisible();
    // Panel must not cover the whole header brand
    await expect(
      page.getByRole("link", { name: /arena by kyvora/i }),
    ).toBeVisible();
  });
});

test.describe("Notifications — long text (mocked list)", () => {
  test("long title/body wrap without horizontal overflow @ 375x667", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const { token, organizationId } = await bootstrapSession(page);

    // Intercept list to inject extreme content without depending on DB seed.
    await page.route(
      `**/api/v1/arena/teams/${organizationId}/notifications**`,
      async (route) => {
        if (route.request().method() !== "GET") {
          await route.continue();
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "ok",
            data: {
              items: [
                {
                  id: "n-long-1",
                  organization_id: organizationId,
                  title:
                    "Desafio recebido de um time com nome extremamente longo para validar quebra de linha no painel de avisos do Arena Kyvora",
                  body: "Mensagem muito longa ".repeat(24).trim(),
                  created_at: new Date().toISOString(),
                  read_at: null,
                  challenge_id: null,
                  kind: "challenge_received",
                },
                {
                  id: "n-read-1",
                  organization_id: organizationId,
                  title: "Aviso já lido",
                  body: "Corpo curto",
                  created_at: new Date().toISOString(),
                  read_at: new Date().toISOString(),
                  challenge_id: null,
                  kind: "challenge_accepted",
                },
              ],
              page: 1,
              page_size: 10,
              total: 2,
              has_more: false,
              unread_count: 1,
            },
          }),
        });
      },
    );

    // Keep token in sync for any subsequent API
    await page.addInitScript(
      ([key, value]) => sessionStorage.setItem(key, value),
      [ACCESS_TOKEN_KEY, token] as [string, string],
    );

    const panel = await openPanel(page);
    await expect(page.getByTestId("notification-item")).toHaveCount(2);
    await assertWithinViewport(page, panel, { label: "long-text" });

    const itemBox = await page.getByTestId("notification-item").first().boundingBox();
    const viewport = page.viewportSize()!;
    expect(itemBox).not.toBeNull();
    expect(itemBox!.x).toBeGreaterThanOrEqual(-1);
    expect(itemBox!.x + itemBox!.width).toBeLessThanOrEqual(viewport.width + 1);

    await shot(page, "after", "long-text-375x667.png");
  });

  test("many notifications keep internal scroll @ 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const { token, organizationId } = await bootstrapSession(page);

    const items = Array.from({ length: 12 }, (_, i) => ({
      id: `n-many-${i}`,
      organization_id: organizationId,
      title: `Aviso ${i + 1}`,
      body: `Corpo do aviso número ${i + 1} com detalhe suficiente.`,
      created_at: new Date(Date.now() - i * 60_000).toISOString(),
      read_at: i % 3 === 0 ? new Date().toISOString() : null,
      challenge_id: null,
      kind: "challenge_received",
    }));

    await page.route(
      `**/api/v1/arena/teams/${organizationId}/notifications**`,
      async (route) => {
        if (route.request().method() !== "GET") {
          await route.continue();
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "ok",
            data: {
              items,
              page: 1,
              page_size: 12,
              total: 12,
              has_more: false,
              unread_count: items.filter((x) => !x.read_at).length,
            },
          }),
        });
      },
    );

    await page.addInitScript(
      ([key, value]) => sessionStorage.setItem(key, value),
      [ACCESS_TOKEN_KEY, token] as [string, string],
    );

    const panel = await openPanel(page);
    await assertWithinViewport(page, panel, { label: "many" });

    const list = page.getByTestId("notifications-list");
    const scrollable = await list.evaluate((el) => el.scrollHeight > el.clientHeight + 4);
    expect(scrollable, "expected internal vertical scroll").toBe(true);

    await list.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await assertWithinViewport(page, panel, { label: "many-scrolled" });
    await shot(page, "after", "many-390x844.png");
  });
});

test.describe("Notifications — mark as read", () => {
  test("clicking unread item marks read via API @ 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const { token, organizationId } = await bootstrapSession(page);

    let marked = false;
    await page.route(
      `**/api/v1/arena/teams/${organizationId}/notifications**`,
      async (route) => {
        const url = route.request().url();
        if (route.request().method() === "POST" && url.includes("/read")) {
          marked = true;
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              message: "ok",
              data: {
                id: "n1",
                organization_id: organizationId,
                title: "Desafio recebido",
                body: "Time X te desafiou",
                created_at: new Date().toISOString(),
                read_at: new Date().toISOString(),
                challenge_id: null,
                kind: "challenge_received",
              },
            }),
          });
          return;
        }
        if (route.request().method() === "GET") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              message: "ok",
              data: {
                items: [
                  {
                    id: "n1",
                    organization_id: organizationId,
                    title: "Desafio recebido",
                    body: "Time X te desafiou",
                    created_at: new Date().toISOString(),
                    read_at: null,
                    challenge_id: null,
                    kind: "challenge_received",
                  },
                ],
                page: 1,
                page_size: 10,
                total: 1,
                has_more: false,
                unread_count: 1,
              },
            }),
          });
          return;
        }
        await route.continue();
      },
    );

    await page.addInitScript(
      ([key, value]) => sessionStorage.setItem(key, value),
      [ACCESS_TOKEN_KEY, token] as [string, string],
    );

    const panel = await openPanel(page);
    await assertWithinViewport(page, panel);
    await page.getByTestId("notification-item").click();
    await expect(page.getByTestId("notifications-panel")).toHaveCount(0);
    expect(marked).toBe(true);
  });
});
