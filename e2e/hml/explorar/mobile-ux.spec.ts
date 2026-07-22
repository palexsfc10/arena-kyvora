/**
 * Explorar mobile UX — sticky promo removed, inline Gestão card, friendly dates.
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { assertNoPageHorizontalOverflow } from "../helpers/viewport";
import { requireE2ePassword } from "../helpers/demoUsers";

const API = process.env.PLAYWRIGHT_API_BASE_URL ?? "https://hml-api.kyvoraapp.com.br";
const ACCESS_TOKEN_KEY = "arena_kyvora_access_token";
const OUT = path.join(
  process.cwd(),
  "artifacts",
  "playwright",
  "hml",
  "explorar-mobile-ux",
  "after",
);

async function bootstrap(page: Page) {
  const stamp = Date.now();
  const email = `qa.explore.ux.${stamp}@example.com`;
  const password = requireE2ePassword();
  expect(
    (
      await fetch(`${API}/api/v1/arena/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "QA Explore UX",
          email,
          password,
          confirm_password: password,
          accept_terms: true,
        }),
      })
    ).status,
  ).toBe(201);
  const login = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  expect(login.status).toBe(200);
  let token = ((await login.json()) as { data?: { access_token?: string } }).data
    ?.access_token!;
  const team = await fetch(`${API}/api/v1/arena/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: `UX Team ${stamp}`,
      modality: "futsal",
      city: "Osasco",
      state: "SP",
      participate_in_arena: true,
      discoverable: true,
      public_city: true,
      idempotency_key: `qa-explore-ux-${stamp}`,
    }),
  });
  const teamJson = (await team.json()) as { data?: { access_token?: string } };
  if (teamJson.data?.access_token) token = teamJson.data.access_token;
  await page.addInitScript(
    ([key, value]) => sessionStorage.setItem(key, value),
    [ACCESS_TOKEN_KEY, token] as [string, string],
  );
  // Ensure promo is visible for this session
  await page.addInitScript(() => {
    try {
      localStorage.removeItem("arena_gestao_promo_dismissed_until");
    } catch {
      /* ignore */
    }
  });
}

function item(id: string, name: string, state: string, notes?: string) {
  const active = state !== "none" && state !== "cancelled";
  return {
    id,
    organization_id: `org-${id}`,
    organization_name: name,
    organization_slug: id,
    logo_url: null,
    modality: "futsal",
    city: "Osasco",
    region: "SP",
    available_from: "2026-07-22",
    available_until: null,
    preferred_period: "flexible",
    venue_option: "to_arrange",
    venue_description: null,
    notes: notes ?? null,
    expires_at: "2026-08-01T00:00:00Z",
    created_at: "2026-07-20T00:00:00Z",
    challenge_context: {
      state,
      challenge_id: active ? `chal-${id}` : null,
      proposed_date: active ? "2026-07-30" : null,
      proposed_time: active ? "06:00:00" : null,
      direction: "sent",
    },
  };
}

async function mockExplore(page: Page) {
  await page.route("**/api/v1/arena/explore**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "ok",
        data: {
          items: [
            item("a", "Time Alpha", "none"),
            item("b", "Time Beta", "none", "teste"),
            item("c", "Time Gama", "none"),
            item("d", "Time Delta", "accepted"),
            item("e", "Time Épsilon", "none"),
          ],
          page: 1,
          page_size: 20,
          total: 5,
          has_more: false,
        },
      }),
    });
  });
  await page.route("**/api/v1/arena/teams/*/next-match**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "ok",
        data: {
          challenge_id: "next-1",
          proposed_date: "2026-07-30",
          proposed_time: "06:00:00",
          venue_option: "to_arrange",
          venue_description: null,
          status: "accepted",
          opponent_organization_id: "opp-1",
          opponent_organization_name: "Rival FC",
          opponent_logo_url: null,
          own_organization_id: "own-1",
          own_organization_name: "Own",
          own_logo_url: null,
          direction: "sent",
        },
      }),
    });
  });
}

test.describe("Explorar mobile UX polish", () => {
  test.beforeAll(() => fs.mkdirSync(OUT, { recursive: true }));

  for (const vp of [
    { name: "360x800", width: 360, height: 800 },
    { name: "390x844", width: 390, height: 844 },
  ]) {
    test(`no sticky promo; inline card; friendly dates @ ${vp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await bootstrap(page);
      await mockExplore(page);
      await page.goto("/app/explorar");

      await expect(page.getByTestId("mobile-bottom-nav")).toBeVisible();
      await expect(page.locator('aside.fixed, [data-sticky-gestao-promo]')).toHaveCount(0);
      await expect(page.getByText(/teste grátis por 7 dias/i)).toHaveCount(0);
      // Header may show abbreviated Gestão CTA; it must not be a sticky bottom banner.
      const mobileHeaderCta = page.locator('header a[data-cta-viewport="mobile"]');
      if ((await mobileHeaderCta.count()) > 0) {
        await expect(mobileHeaderCta.first()).toBeVisible();
      }

      const promo = page.getByTestId("gestao-promo-card");
      await expect(promo).toBeVisible();
      await promo.scrollIntoViewIfNeeded();

      const nav = page.getByTestId("mobile-bottom-nav");
      const promoBox = await promo.boundingBox();
      const navBox = await nav.boundingBox();
      expect(promoBox).not.toBeNull();
      expect(navBox).not.toBeNull();
      // After scroll into view, promo must not sit under the sticky bottom nav.
      expect(promoBox!.y + promoBox!.height).toBeLessThanOrEqual(navBox!.y + 1);
      expect(promoBox!.x).toBeGreaterThanOrEqual(-1);
      expect(promoBox!.x + promoBox!.width).toBeLessThanOrEqual(vp.width + 1);

      const next = page.getByTestId("next-match-card");
      await expect(next).toContainText(/30 de julho/i);
      await expect(next).toContainText(/às 6h/i);
      await expect(next).not.toContainText(/06:00:00/);
      await expect(next).toContainText(/local a definir/i);
      await expect(next.getByRole("link", { name: /ver partida/i })).toBeVisible();

      await expect(page.getByText(/disponível em 22 de julho/i).first()).toBeVisible();
      await expect(page.getByText(/observação:\s*teste/i)).toBeVisible();
      await expect(page.getByText(/^teste$/)).toHaveCount(0);

      const confirmed = page.locator('[data-relation-state="accepted"]');
      await expect(confirmed.getByTestId("explore-desafiar")).toHaveCount(0);
      await expect(confirmed.getByText(/desafio confirmado/i)).toBeVisible();

      await assertNoPageHorizontalOverflow(page);
      await page.screenshot({
        path: path.join(OUT, `explore-${vp.name}.png`),
        fullPage: true,
      });
    });
  }

  test("promo dismiss persists for session storage window @ 375x667", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await bootstrap(page);
    await mockExplore(page);
    await page.goto("/app/explorar");
    await expect(page.getByTestId("gestao-promo-card")).toBeVisible();
    await page.getByTestId("gestao-promo-dismiss").click();
    await expect(page.getByTestId("gestao-promo-card")).toHaveCount(0);
    await page.reload();
    await expect(page.getByTestId("gestao-promo-card")).toHaveCount(0);
  });
});
