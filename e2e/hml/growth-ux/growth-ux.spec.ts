/**
 * Growth + challenge card UX — evidence pack (local or HML shell).
 * Auth/session and list APIs are mocked so layout gates do not depend on CORS.
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { assertNoPageHorizontalOverflow } from "../helpers/viewport";

const ACCESS_TOKEN_KEY = "arena_kyvora_access_token";
const ROOT = path.join(
  process.cwd(),
  "artifacts",
  "playwright",
  "hml",
  process.env.GROWTH_UX_ARTIFACT_DIR ?? "growth-ux",
);

async function shot(page: Page, rel: string) {
  const dest = path.join(ROOT, "after", rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await page.screenshot({ path: dest, fullPage: true });
  return dest;
}

const SESSION = {
  user: { id: "u1", name: "QA Growth", email: "qa.growth@example.com" },
  teams: [
    {
      organization_id: "org-self",
      name: "Growth Team",
      logo_url: null,
      arena_enabled: true,
      can_manage: true,
    },
  ],
  selected_organization_id: "org-self",
  can_manage_selected: true,
};

async function installAuth(page: Page) {
  await page.addInitScript(
    ([key, token]) => {
      sessionStorage.setItem(key, token);
      try {
        if (!sessionStorage.getItem("arena_e2e_promo_seeded")) {
        localStorage.removeItem("arena_gestao_promo_dismissed_until");
        localStorage.removeItem("arena_gestao_promo_login_until");
        localStorage.removeItem("arena_gestao_promo_my_team_until");
        localStorage.removeItem("arena_gestao_promo_explore_mobile_top_until");
        sessionStorage.removeItem("arena_gestao_promo_highlight_shown");
        sessionStorage.setItem("arena_e2e_promo_seeded", "1");
        }
      } catch {
        /* ignore */
      }
    },
    [ACCESS_TOKEN_KEY, "e2e-growth-token"] as [string, string],
  );

  await page.route("**/api/v1/arena/session**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: SESSION }),
    });
  });
  await page.route("**/api/v1/arena/teams/*/challenges/pending-count**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: { pending_received: 0 } }),
    });
  });
  await page.route("**/api/v1/arena/notifications**", async (route) => {
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
  });
}

function exploreItems() {
  const mk = (id: string, name: string, state: string) => ({
    id,
    organization_id: `org-${id}`,
    organization_name: name,
    organization_slug: id,
    logo_url: null,
    modality: "futsal",
    city: "Osasco",
    region: "SP",
    available_from: "2026-07-30",
    available_until: null,
    preferred_period: "evening",
    venue_option: "to_arrange",
    venue_description: null,
    notes: null,
    expires_at: "2026-08-01T00:00:00Z",
    created_at: "2026-07-20T00:00:00Z",
    challenge_context: {
      state,
      challenge_id: state === "none" ? null : `ch-${id}`,
      proposed_date: state === "none" ? null : "2026-07-30",
      proposed_time: state === "none" ? null : "20:00:00",
      direction: state.startsWith("incoming") ? "received" : "sent",
    },
  });
  return [
    mk("1", "Alpha FC", "none"),
    mk("2", "Beta United com nome bem longo para estresse", "outgoing_pending"),
    mk("3", "Gamma SC", "incoming_pending"),
    mk("4", "Delta Esporte", "accepted"),
    mk("5", "Echo Clube", "none"),
  ];
}

test.describe("Growth UX + challenge card actions", () => {
  test("login promo, header, explore layout, meu time @ 360/390/1440", async ({
    page,
  }) => {
    await installAuth(page);

    await page.route("**/api/v1/arena/explore**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { items: exploreItems(), page: 1, page_size: 20, total: 5, has_more: false },
        }),
      });
    });
    await page.route("**/api/v1/arena/**/next-match**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: null }),
      });
    });
    await page.route("**/api/v1/arena/teams/*/settings**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            organization_id: "org-self",
            name: "Growth Team",
            modality: "futsal",
            city: "Osasco",
            state: "SP",
            arena_enabled: true,
            discoverable: true,
            public_city: true,
            public_description: "",
            logo_url: null,
          },
        }),
      });
    });
    await page.route("**/api/v1/arena/teams/*/reputation**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            reputation_building: true,
            badges: [],
            avg_overall: null,
            avg_punctuality: null,
            avg_organization: null,
            avg_fair_play: null,
            avg_communication: null,
            ratings_count: 0,
          },
        }),
      });
    });
    await page.route("**/api/v1/arena/teams/*/challenges**", async (route) => {
      const url = route.request().url();
      if (url.includes("pending-count") || route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            items: [
              {
                id: "ch-sent",
                direction: "sent",
                status: "pending",
                sender_organization_name: "Growth Team",
                sender_logo_url: null,
                recipient_organization_name: "Rival FC",
                recipient_logo_url: null,
                proposed_date: "2026-07-30",
                proposed_time: "20:00:00",
                venue_option: "to_arrange",
                venue_description: null,
                contact_phone: null,
                message: null,
                schedule_conflict_hint: false,
              },
              {
                id: "ch-recv",
                direction: "received",
                status: "pending",
                sender_organization_name: "Challenger United Long Name",
                sender_logo_url: null,
                recipient_organization_name: "Growth Team",
                recipient_logo_url: null,
                proposed_date: "2026-07-31",
                proposed_time: "19:30:00",
                venue_option: "yes",
                venue_description: "Ginásio Central",
                contact_phone: null,
                message: "Vamos jogar?",
                schedule_conflict_hint: false,
              },
              {
                id: "ch-acc",
                direction: "received",
                status: "accepted",
                sender_organization_name: "Confirmados SC",
                sender_logo_url: null,
                recipient_organization_name: "Growth Team",
                recipient_logo_url: null,
                proposed_date: "2026-08-01",
                proposed_time: "18:00:00",
                venue_option: "to_arrange",
                venue_description: null,
                contact_phone: null,
                message: null,
                schedule_conflict_hint: false,
              },
            ],
            page: 1,
            page_size: 50,
            total: 3,
            has_more: false,
          },
        }),
      });
    });

    // --- Explorar 360 ---
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/app/explorar");
    await expect(page.getByRole("heading", { name: /Explorar jogos/i })).toBeVisible();
    await expect(page.getByTestId("gestao-promo-explore-mobile-top")).toBeVisible();
    // Desktop/tablet login promo remains in the DOM but is CSS-hidden below md.
    await expect(page.getByTestId("gestao-promo-login")).toBeHidden();
    await expect(page.getByTestId("gestao-promo-card")).toBeVisible();
    await assertNoPageHorizontalOverflow(page);
    const headerCta = page.getByTestId("gestao-header-cta-mobile");
    await expect(headerCta).toBeVisible();
    const headerBox = await page.locator("header").boundingBox();
    expect(headerBox).toBeTruthy();
    expect(headerBox!.width).toBeLessThanOrEqual(360 + 1);

    const cards = page.getByTestId("explore-card");
    await expect(cards).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      const card = cards.nth(i);
      const actions = card.getByTestId("explore-card-actions");
      await expect(actions).toBeVisible();
      const cardBox = await card.boundingBox();
      const actBox = await actions.boundingBox();
      expect(cardBox && actBox).toBeTruthy();
      expect(actBox!.y).toBeGreaterThan(cardBox!.y + 20);
      expect(actBox!.width).toBeGreaterThan(cardBox!.width * 0.85);
    }
    await shot(page, "explorar/360-login-and-cards.png");

    // Dismiss mobile top promo; should persist
    await page.getByTestId("gestao-promo-dismiss-explore-mobile-top").click();
    await expect(page.getByTestId("gestao-promo-explore-mobile-top")).toHaveCount(0);
    await shot(page, "login/360-dismissed.png");
    await page.reload();
    await expect(page.getByTestId("gestao-promo-explore-mobile-top")).toHaveCount(0);
    await expect(page.getByTestId("gestao-promo-card")).toBeVisible();
    await shot(page, "login/360-after-refresh.png");

    // --- Explorar 390 ---
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/app/explorar");
    await assertNoPageHorizontalOverflow(page);
    await shot(page, "explorar/390-full.png");

    // --- Header desktop ---
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/app/explorar");
    await expect(page.getByTestId("gestao-header-cta")).toBeVisible();
    await expect(page.getByTestId("gestao-header-cta")).toHaveAttribute(
      "href",
      /kyvoraapp\.com\.br|localhost/,
    );
    await assertNoPageHorizontalOverflow(page);
    await shot(page, "header/1440.png");
    await shot(page, "explorar/1440-full.png");

    // --- Meu time ---
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/app/meu-time");
    await expect(page.getByTestId("gestao-promo-my_team")).toBeVisible();
    const promo = page.getByTestId("gestao-promo-my_team");
    const heading = page.getByRole("heading", { name: /Meu time/i });
    const promoBox = await promo.boundingBox();
    const headBox = await heading.boundingBox();
    expect(promoBox && headBox).toBeTruthy();
    expect(promoBox!.y).toBeGreaterThan(headBox!.y + 80);
    await assertNoPageHorizontalOverflow(page);
    await shot(page, "meu-time/390.png");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/app/meu-time");
    await expect(page.getByTestId("gestao-promo-my_team")).toBeVisible();
    await shot(page, "meu-time/1440.png");

    // --- Desafios 360 ---
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/app/desafios");
    await page.getByRole("tab", { name: /Recebidos/i }).click();
    await expect(page.getByTestId("challenge-card").first()).toBeVisible();
    await shot(page, "desafios/360-recebido.png");

    await page.getByRole("tab", { name: /Enviados/i }).click();
    await expect(page.getByTestId("challenge-card").first()).toBeVisible();
    await expect(page.getByText(/Desafio enviado/i).first()).toBeVisible();
    await shot(page, "desafios/360-enviado.png");

    await page.getByRole("tab", { name: /Confirmados/i }).click();
    await expect(page.getByTestId("challenge-card").first()).toBeVisible();
    await shot(page, "desafios/360-confirmado.png");

    const challengeCards = page.getByTestId("challenge-card");
    const n = await challengeCards.count();
    expect(n).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < n; i++) {
      const card = challengeCards.nth(i);
      const actions = card.getByTestId("challenge-card-actions").last();
      await expect(actions).toBeVisible();
      const cb = await card.boundingBox();
      const ab = await actions.boundingBox();
      expect(cb && ab).toBeTruthy();
      expect(ab!.y).toBeGreaterThan(cb!.y + 40);
    }
    await assertNoPageHorizontalOverflow(page);
    await shot(page, "desafios/360-cards.png");

    const bottom = page.getByTestId("mobile-bottom-nav");
    await expect(bottom).toBeVisible();
    const stickyPromo = page.locator("aside.fixed, [data-cta-viewport='mobile'].fixed");
    await expect(stickyPromo).toHaveCount(0);
    await shot(page, "desafios/360-bottom-nav.png");
  });
});
