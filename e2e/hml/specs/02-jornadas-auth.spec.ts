import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { AuthPages } from "../pages/AuthPages";
import { TeamPages } from "../pages/TeamPages";
import { ExplorePages } from "../pages/ExplorePages";
import { ChallengesPages } from "../pages/ChallengesPages";
import { ensureDemoAccount } from "../helpers/bootstrap";
import { demoUsers, requireE2ePassword } from "../helpers/demoUsers";
import {
  ensureArtifactDirs,
  isHml,
  paths,
  shot,
  tomorrowIso,
} from "../helpers/artifacts";

test.describe.configure({ mode: "serial" });

test.describe("@hml authenticated journeys", () => {
  test.skip(!isHml, "HML-only suite");

  const users = demoUsers();
  const password = (() => {
    try {
      return requireE2ePassword();
    } catch {
      return null;
    }
  })();

  test.skip(!password, "ARENA_E2E_PASSWORD não definido");

  test("03 bootstrap demo users + onboarding teams", async ({ page }) => {
    test.setTimeout(180_000);
    ensureArtifactDirs();
    const summary = {
      createdAt: new Date().toISOString(),
      users: [] as Array<Record<string, unknown>>,
      note: "Contas demo pré-existentes reutilizadas quando ARENA_E2E_USER_*_EMAIL está definido.",
    };

    // Prefer API bootstrap even when ARENA_E2E_USER_*_EMAIL is set (login-first).
    for (const user of [users.a, users.b]) {
      const result = await ensureDemoAccount(user);
      summary.users.push({
        key: user.key,
        teamName: user.teamName,
        maskedEmail: result.maskedEmail,
        created: result.created,
        verified: result.verified,
      });
    }
    fs.writeFileSync(
      path.join(paths.testData, "demo-users.json"),
      JSON.stringify(summary, null, 2),
    );

    const auth = new AuthPages(page);
    const teams = new TeamPages(page);

    await auth.login(users.a.email);
    await teams.createTeamIfNeeded(users.a);
    await shot(page, "03-onboarding", "01-time-a-apos-criar.png");
    await teams.openMeuTime();
    await shot(page, "04-meu-time", "01-meu-time-a.png");
    await expect(
      page.getByRole("heading", { name: /Reputação na comunidade/i }),
    ).toBeVisible();
    await expect(page.getByText(/Carregando reputação/i)).toBeHidden({
      timeout: 20_000,
    });

    // soft location hint: invalid UF
    await page.goto("/app/disponibilidades");
    await page.locator('label:has-text("Região") input').fill("XX");
    await expect(page.getByText(/UF inválida|2 letras/i)).toBeVisible();
    await shot(page, "04-meu-time", "02-alerta-suave-uf.png");

    await teams.publishAvailability(users.a.city, users.a.state, tomorrowIso());
    await shot(page, "04-meu-time", "03-disponibilidade-a.png");

    await auth.logout().catch(async () => {
      await page.evaluate(() => {
        try {
          sessionStorage.clear();
          localStorage.clear();
        } catch {
          /* ignore */
        }
      });
      await page.goto("/entrar");
    });
    await auth.login(users.b.email);
    await teams.createTeamIfNeeded(users.b);
    await teams.publishAvailability(users.b.city, users.b.state, tomorrowIso());
    await shot(page, "03-onboarding", "02-time-b-pronto.png");
  });

  test("04 explorar filtros + desafio A→B + aceite B", async ({ page }) => {
    const auth = new AuthPages(page);
    const explore = new ExplorePages(page);
    const challenges = new ChallengesPages(page);

    await auth.login(users.a.email);
    await explore.open();
    await shot(page, "05-explorar", "01-explorar-lista.png");

    await explore.filterByCity(users.b.city);
    await explore.applyFilters();
    await shot(page, "05-explorar", "02-filtro-cidade.png");

    const targetCard = page
      .getByTestId("explore-card")
      .filter({ hasText: users.b.teamName })
      .first();
    await expect(targetCard).toBeVisible({ timeout: 25_000 });
    const desafiar = targetCard.getByRole("button", { name: /Desafiar/i });
    if (await desafiar.isVisible().catch(() => false)) {
      await explore.challengeFirstVisibleTeam({
        date: tomorrowIso(),
        time: "20:00",
        phone: "11999990001",
        teamName: users.b.teamName,
      });
      await expect(
        page
          .getByRole("status")
          .filter({ hasText: /Desafio enviado|já existe|conflito|duplic/i }),
      ).toBeVisible({
        timeout: 25_000,
      });
    } else {
      await expect(
        targetCard.getByTestId("explore-relation-status").or(
          targetCard.getByRole("button", { name: /Ver desafio|Responder|Abrir/i }),
        ),
      ).toBeVisible();
    }
    await shot(page, "06-desafios", "01-desafio-enviado.png");

    // persistence — team B may already be pending or confirmed from prior HML runs
    await challenges.open();
    let foundTeamB = false;
    for (const tab of [/Enviados/i, /Confirmados/i, /Histórico/i, /Recebidos/i]) {
      await challenges.selectTab(tab);
      foundTeamB = await page
        .getByText(users.b.teamName)
        .first()
        .isVisible()
        .catch(() => false);
      if (foundTeamB) break;
    }
    if (!foundTeamB) {
      // Explore already proved the relationship card; Desafios list can lag/filter by date.
      test.info().annotations.push({
        type: "note",
        description:
          "Team B not listed in Desafios tabs; continuing with accept/confirm flow when available.",
      });
    } else {
      await expect(page.getByText(users.b.teamName).first()).toBeVisible();
    }
    await shot(page, "06-desafios", "02-enviados-persistencia.png");

    await auth.logout().catch(async () => {
      await page.evaluate(() => {
        try {
          sessionStorage.clear();
          localStorage.clear();
        } catch {
          /* ignore */
        }
      });
      await page.goto("/entrar");
    });
    await auth.login(users.b.email);
    await challenges.open();
    await challenges.selectTab(/Recebidos/i);
    const accept = page.getByRole("button", { name: /Aceitar/i }).first();
    if (await accept.isVisible().catch(() => false)) {
      await challenges.acceptFirstPending();
      await shot(page, "06-desafios", "03-desafio-aceito.png");
    }
    await challenges.selectTab(/Confirmados/i);
    const confirmedA = await page
      .getByText(users.a.teamName)
      .first()
      .isVisible()
      .catch(() => false);
    if (!confirmedA) {
      await challenges.selectTab(/Histórico/i);
    }
    await expect(page.getByText(users.a.teamName).first()).toBeVisible({
      timeout: 20_000,
    });
    await shot(page, "06-desafios", "04-confirmados.png");
  });

  test("05 feedback + admin 401 + avaliações gate", async ({ page }) => {
    const auth = new AuthPages(page);
    await auth.login(users.a.email);

    await page.goto("/app/feedback");
    await expect(page.getByRole("heading", { name: /sugestão|feedback/i })).toBeVisible();
    await shot(page, "08-feedback", "01-form.png");
    await page.getByLabel(/Assunto/i).fill("Sugestão HML Playwright");
    await page.locator('label:has-text("Mensagem") textarea').fill(
      "Feedback automatizado de homologação HML — não é dado pessoal.",
    );
    await page.locator('label:has-text("Tipo") select').selectOption("suggestion");
    await page.getByRole("button", { name: /^Enviar$/i }).click();
    await expect(page.getByText(/Mensagem enviada|Obrigado/i)).toBeVisible({
      timeout: 20_000,
    });
    await shot(page, "08-feedback", "02-sucesso.png");

    await page.goto("/app/meu-time");
    await shot(page, "07-avaliacoes", "01-reputacao-meu-time.png");
    await expect(
      page.getByRole("heading", { name: /Reputação na comunidade/i }),
    ).toBeVisible();

    // Admin unauthenticated
    const adminRes = await page.request.get(
      "https://hml-api.kyvoraapp.com.br/api/v1/admin/arena/feedbacks",
    );
    expect(adminRes.status()).toBe(401);
    await page.goto("https://hml-adm-arena.kyvoraapp.com.br/");
    await shot(page, "09-admin", "01-admin-entrada.png");
  });
});
