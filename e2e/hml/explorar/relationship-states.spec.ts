/**
 * Explore relationship states — UX matrix (mocked API, HML shell).
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { assertWithinViewport } from "../helpers/viewport";
import { requireE2ePassword } from "../helpers/demoUsers";

const API = process.env.PLAYWRIGHT_API_BASE_URL ?? "https://hml-api.kyvoraapp.com.br";
const ACCESS_TOKEN_KEY = "arena_kyvora_access_token";
const OUT = path.join(
  process.cwd(),
  "artifacts",
  "playwright",
  "hml",
  "explorar-relationship-states",
  "screenshots",
);

type CtxState =
  | "none"
  | "outgoing_pending"
  | "incoming_pending"
  | "accepted"
  | "cancelled";

function availability(overrides: {
  id: string;
  name: string;
  state: CtxState;
  direction?: "sent" | "received";
}) {
  const active = overrides.state !== "none" && overrides.state !== "cancelled";
  return {
    id: overrides.id,
    organization_id: `org-${overrides.id}`,
    organization_name: overrides.name,
    organization_slug: overrides.id,
    logo_url: null,
    modality: "futsal",
    city: "Osasco",
    region: "SP",
    available_from: "2026-07-24",
    available_until: "2026-07-24",
    preferred_period: "evening",
    venue_option: "to_arrange",
    venue_description: null,
    notes: null,
    expires_at: "2026-08-01T00:00:00Z",
    created_at: "2026-07-20T00:00:00Z",
    challenge_context: {
      state: overrides.state,
      challenge_id: active ? `chal-${overrides.id}` : null,
      proposed_date: active ? "2026-07-24" : null,
      proposed_time: active ? "20:00:00" : null,
      direction: overrides.direction ?? "sent",
    },
  };
}

async function bootstrap(page: Page) {
  const stamp = Date.now();
  const email = `qa.explore.rel.${stamp}@example.com`;
  const password = requireE2ePassword();
  const reg = await fetch(`${API}/api/v1/arena/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      name: "QA Explore Rel",
      email,
      password,
      confirm_password: password,
      accept_terms: true,
    }),
  });
  expect(reg.status).toBe(201);
  const login = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  expect(login.status).toBe(200);
  const loginJson = (await login.json()) as { data?: { access_token?: string } };
  let token = loginJson.data?.access_token!;
  const team = await fetch(`${API}/api/v1/arena/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: `Explore Rel ${stamp}`,
      modality: "futsal",
      city: "Osasco",
      state: "SP",
      participate_in_arena: true,
      discoverable: true,
      public_city: true,
      idempotency_key: `qa-explore-rel-${stamp}`,
    }),
  });
  const teamText = await team.text();
  expect(team.status, teamText).toBeLessThan(300);
  const teamJson = JSON.parse(teamText) as {
    data?: { access_token?: string };
  };
  if (teamJson.data?.access_token) token = teamJson.data.access_token;

  await page.addInitScript(
    ([key, value]) => sessionStorage.setItem(key, value),
    [ACCESS_TOKEN_KEY, token] as [string, string],
  );
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
            availability({ id: "none", name: "Time Livre FC", state: "none" }),
            availability({
              id: "sent",
              name: "Time Aguardando",
              state: "outgoing_pending",
            }),
            availability({
              id: "recv",
              name: "Time Resposta",
              state: "incoming_pending",
              direction: "received",
            }),
            availability({
              id: "ok",
              name: "Time Confirmado",
              state: "accepted",
            }),
            availability({
              id: "end",
              name: "Time Liberado",
              state: "cancelled",
            }),
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
      body: JSON.stringify({ success: true, message: "ok", data: null }),
    });
  });
}

test.describe("Explorar — relationship matrix", () => {
  test.beforeAll(() => {
    fs.mkdirSync(OUT, { recursive: true });
  });

  test("cards expose correct CTA per state @ 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await bootstrap(page);
    await mockExplore(page);
    await page.goto("/app/explorar");
    await expect(page.getByTestId("explore-card")).toHaveCount(5);

    const none = page.locator('[data-relation-state="none"]');
    await expect(none.getByTestId("explore-desafiar")).toBeVisible();
    await expect(none.getByTestId("explore-primary-action")).toHaveCount(0);

    const sent = page.locator('[data-relation-state="outgoing_pending"]');
    await expect(sent.getByTestId("explore-desafiar")).toHaveCount(0);
    await expect(sent.getByText(/desafio enviado/i)).toBeVisible();
    await expect(sent.getByTestId("explore-primary-action")).toHaveAttribute(
      "href",
      /challenge=chal-sent/,
    );

    const recv = page.locator('[data-relation-state="incoming_pending"]');
    await expect(recv.getByTestId("explore-desafiar")).toHaveCount(0);
    await expect(recv.getByText(/desafio recebido/i)).toBeVisible();
    await expect(recv.getByRole("link", { name: /responder desafio/i })).toBeVisible();

    const ok = page.locator('[data-relation-state="accepted"]');
    await expect(ok.getByTestId("explore-desafiar")).toHaveCount(0);
    await expect(ok.getByText(/desafio confirmado/i)).toBeVisible();
    await expect(ok.getByText(/24 de julho/i)).toBeVisible();
    await expect(ok.getByRole("link", { name: /ver desafio/i })).toBeVisible();

    const end = page.locator('[data-relation-state="cancelled"]');
    await expect(end.getByTestId("explore-desafiar")).toBeVisible();

    await page.screenshot({
      path: path.join(OUT, "matrix-mobile-390x844.png"),
      fullPage: true,
    });

    const firstCard = page.getByTestId("explore-card").first();
    await assertWithinViewport(page, firstCard, { label: "explore-card" });
  });

  test("desktop matrix @ 1440x900", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await bootstrap(page);
    await mockExplore(page);
    await page.goto("/app/explorar");
    await expect(page.locator('[data-relation-state="accepted"]').getByTestId("explore-desafiar")).toHaveCount(0);
    await page.screenshot({
      path: path.join(OUT, "matrix-desktop-1440x900.png"),
      fullPage: true,
    });
  });
});
