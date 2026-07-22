/**
 * Capture structured Explorar UX evidence into artifacts/.../explorar-ux/
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { requireE2ePassword } from "../helpers/demoUsers";

const API = process.env.PLAYWRIGHT_API_BASE_URL ?? "https://hml-api.kyvoraapp.com.br";
const ACCESS_TOKEN_KEY = "arena_kyvora_access_token";
const ROOT = path.join(
  process.cwd(),
  "artifacts",
  "playwright",
  "hml",
  "explorar-ux",
);

function item(id: string, name: string, state: string, notes?: string) {
  const active = state !== "none";
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

test("capture after evidence pack", async ({ page }) => {
  fs.mkdirSync(path.join(ROOT, "after", "mobile"), { recursive: true });
  fs.mkdirSync(path.join(ROOT, "after", "desktop"), { recursive: true });
  fs.mkdirSync(path.join(ROOT, "videos"), { recursive: true });

  const stamp = Date.now();
  const email = `qa.explore.ev.${stamp}@example.com`;
  const password = requireE2ePassword();
  expect(
    (
      await fetch(`${API}/api/v1/arena/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "QA Evidence",
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
  let token = ((await login.json()) as { data?: { access_token?: string } }).data
    ?.access_token!;
  const team = await fetch(`${API}/api/v1/arena/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: `Ev Team ${stamp}`,
      modality: "futsal",
      city: "Osasco",
      state: "SP",
      participate_in_arena: true,
      discoverable: true,
      public_city: true,
      idempotency_key: `qa-ev-${stamp}`,
    }),
  });
  const teamJson = (await team.json()) as { data?: { access_token?: string } };
  if (teamJson.data?.access_token) token = teamJson.data.access_token;

  await page.addInitScript(
    ([key, value]) => {
      sessionStorage.setItem(key, value);
      try {
        localStorage.removeItem("arena_gestao_promo_dismissed_until");
      } catch {
        /* ignore */
      }
    },
    [ACCESS_TOKEN_KEY, token] as [string, string],
  );

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
            item("e", "Time Épsilon", "outgoing_pending"),
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

  // Mobile 390 — full page + cropped sections
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/explorar");
  await expect(page.getByTestId("mobile-bottom-nav")).toBeVisible();
  await expect(page.locator('a[data-cta-viewport="mobile"]')).toHaveCount(0);

  await page.screenshot({
    path: path.join(ROOT, "after", "mobile", "full-390x844.png"),
    fullPage: true,
  });
  await page.getByTestId("next-match-card").screenshot({
    path: path.join(ROOT, "after", "mobile", "next-match.png"),
  });
  await page.locator('[data-relation-state="none"]').first().screenshot({
    path: path.join(ROOT, "after", "mobile", "available-card.png"),
  });
  await page.locator('[data-relation-state="accepted"]').screenshot({
    path: path.join(ROOT, "after", "mobile", "confirmed-card.png"),
  });
  const promo = page.getByTestId("gestao-promo-card");
  await promo.scrollIntoViewIfNeeded();
  await promo.screenshot({
    path: path.join(ROOT, "after", "mobile", "promo-card.png"),
  });
  await page.getByTestId("mobile-bottom-nav").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: path.join(ROOT, "after", "mobile", "bottom-nav-390.png"),
    fullPage: false,
  });

  // Mobile 360
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/app/explorar");
  await page.screenshot({
    path: path.join(ROOT, "after", "mobile", "full-360x800.png"),
    fullPage: true,
  });

  // Desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/app/explorar");
  await expect(page.getByTestId("next-match-card")).toBeVisible({ timeout: 20_000 });
  await page.screenshot({
    path: path.join(ROOT, "after", "desktop", "full-1440x900.png"),
    fullPage: true,
  });
  await expect(page.locator('a[data-cta-viewport="mobile"]')).toHaveCount(0);
});
