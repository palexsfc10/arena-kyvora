/**
 * Explorar mobile promo + responsiveness — HML/public or local shell.
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { assertNoPageHorizontalOverflow, assertWithinViewport } from "../helpers/viewport";

const ACCESS_TOKEN_KEY = "arena_kyvora_access_token";
const ROOT = path.join(
  process.cwd(),
  "artifacts",
  "playwright",
  "hml",
  "explore-mobile-promo",
);

async function shot(page: Page, rel: string) {
  const dest = path.join(ROOT, "after", rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await page.screenshot({ path: dest, fullPage: true });
  return dest;
}

const SESSION = {
  user_id: "u1",
  user_name: "QA Explore",
  user_email: "qa.explore@example.com",
  teams: [
    {
      organization_id: "org-self",
      name: "Growth Team Long Name FC",
      slug: "growth",
      city: "Osasco",
      state: "SP",
      modality: "futsal",
      logo_url: null,
      role: "owner",
      can_manage: true,
      arena_enabled: true,
      discoverable: true,
    },
  ],
  selected_organization_id: "org-self",
  selected_role: "owner",
  can_manage_selected: true,
  gestao_url: "https://hml.kyvoraapp.com.br",
};

async function installAuth(page: Page) {
  await page.route("**/api/v1/arena/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/session")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: SESSION }),
      });
      return;
    }
    if (url.includes("/explore")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { items: [], page: 1, page_size: 20, total: 0, has_more: false },
        }),
      });
      return;
    }
    if (url.includes("pending-count") || url.includes("unread-count")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { pending_received: 0, unread_count: 0 },
        }),
      });
      return;
    }
    if (url.includes("notifications")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            items: [],
            page: 1,
            page_size: 10,
            total: 0,
            has_more: false,
            unread_count: 0,
          },
        }),
      });
      return;
    }
    if (url.includes("next-match") || url.includes("filter-options")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: url.includes("filter-options") ? { cities: [] } : null,
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: null }),
    });
  });

  await page.addInitScript(
    ([key, token]) => {
      sessionStorage.setItem(key, token);
      try {
        if (!sessionStorage.getItem("arena_e2e_explore_mobile_seeded")) {
          localStorage.removeItem("arena_gestao_promo_explore_mobile_top_until");
          localStorage.removeItem("arena_gestao_promo_dismissed_until");
          localStorage.removeItem("arena_gestao_promo_login_until");
          sessionStorage.removeItem("arena_gestao_promo_highlight_shown");
          sessionStorage.setItem("arena_e2e_explore_mobile_seeded", "1");
        }
      } catch {
        /* ignore */
      }
    },
    [ACCESS_TOKEN_KEY, "e2e-explore-mobile"] as [string, string],
  );
}

async function assertCriticalBoxes(page: Page) {
  const viewport = page.viewportSize()!;
  const selectors = [
    "header",
    '[data-testid="gestao-header-cta-mobile"]',
    '[data-testid="explore-filters"]',
    '[data-testid="mobile-bottom-nav"]',
    "h1",
  ];
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) === 0) continue;
    if (!(await loc.isVisible())) continue;
    const box = await loc.boundingBox();
    expect(box, sel).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
  }
}

test.describe("Explorar mobile top promo + layout", () => {
  for (const vp of [
    { name: "360", width: 360, height: 800 },
    { name: "375", width: 375, height: 667 },
    { name: "390", width: 390, height: 844 },
    { name: "412", width: 412, height: 915 },
  ]) {
    test(`mobile ${vp.name}: top promo, header chip, 1-col filters, no overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await installAuth(page);
      await page.goto("/app/explorar", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: /Explorar jogos/i })).toBeVisible({
        timeout: 30_000,
      });
      const promo = page.getByTestId("gestao-promo-explore-mobile-top");
      await expect(promo).toBeVisible();
      await expect(page.getByTestId("gestao-promo-login")).toBeHidden();

      const header = page.locator("header");
      const title = page.getByRole("heading", { name: /Explorar jogos/i });
      const promoBox = await promo.boundingBox();
      const headerBox = await header.boundingBox();
      const titleBox = await title.boundingBox();
      expect(promoBox && headerBox && titleBox).toBeTruthy();
      expect(promoBox!.y).toBeGreaterThan(headerBox!.y + headerBox!.height - 2);
      expect(titleBox!.y).toBeGreaterThan(promoBox!.y + 8);

      const cta = page.getByTestId("gestao-promo-cta-explore-mobile-top");
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAttribute("href", /kyvoraapp\.com\.br/);
      await expect(cta).toHaveAttribute("href", /utm_content=top_promo/);
      await expect(cta).toHaveAttribute("href", /utm_campaign=mobile_explore/);
      await expect(cta).toHaveAttribute("href", /utm_medium=app/);
      const ctaBox = await cta.boundingBox();
      expect(ctaBox!.width).toBeGreaterThan(vp.width * 0.7);

      const gestao = page.getByTestId("gestao-header-cta-mobile");
      await expect(gestao).toBeVisible();
      await assertWithinViewport(page, gestao, { label: "header Gestão chip" });

      await expect(page.getByTestId("header-account-menu")).toBeVisible();
      await page.getByTestId("header-account-menu").click();
      await expect(page.getByTestId("header-account-menu-panel")).toBeVisible();
      await expect(page.getByRole("menuitem", { name: /Enviar sugestão/i })).toBeVisible();
      await expect(page.getByRole("menuitem", { name: /Sair/i })).toBeVisible();
      await page.keyboard.press("Escape");

      const filters = page.getByTestId("explore-filters");
      await expect(filters).toBeVisible();
      const filterCols = await filters.evaluate((el) =>
        getComputedStyle(el).gridTemplateColumns.split(" ").length,
      );
      expect(filterCols).toBe(1);

      await assertNoPageHorizontalOverflow(page);
      await assertCriticalBoxes(page);
      await shot(page, `${vp.name}/explorar-full.png`);
      await page.locator("header").screenshot({
        path: path.join(ROOT, "after", "header", `${vp.name}.png`),
      });
      await filters.screenshot({
        path: path.join(ROOT, "after", "filters", `${vp.name}.png`),
      });
      await promo.screenshot({
        path: path.join(ROOT, "after", "promo", `${vp.name}.png`),
      });
    });
  }

  test("desktop 1440: no mobile top promo; login promo may show; header Gestão de Times", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await installAuth(page);
    await page.goto("/app/explorar", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Explorar jogos/i })).toBeVisible({
      timeout: 30_000,
    });

    await expect(page.getByTestId("gestao-promo-explore-mobile-top")).toBeHidden();
    await expect(page.getByTestId("gestao-header-cta")).toBeVisible();
    await expect(page.getByTestId("gestao-header-cta-mobile")).toBeHidden();
    await assertNoPageHorizontalOverflow(page);
    await shot(page, "desktop/1440-explorar.png");
  });

  test("mobile top dismiss persists across refresh", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await installAuth(page);
    await page.goto("/app/explorar", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("gestao-promo-explore-mobile-top")).toBeVisible({
      timeout: 30_000,
    });
    await page.getByTestId("gestao-promo-dismiss-explore-mobile-top").click();
    await expect(page.getByTestId("gestao-promo-explore-mobile-top")).toHaveCount(0);
    await page.reload();
    await expect(page.getByTestId("gestao-promo-explore-mobile-top")).toHaveCount(0);
  });
});
