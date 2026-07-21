import { expect, test } from "@playwright/test";

test.describe("Arena Kyvora landing", () => {
  test("renders core value proposition and coming soon features", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Arena Kyvora/i);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Seu próximo jogo começa aqui/i,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("banner").getByText("Arena Kyvora", { exact: true }),
    ).toBeVisible();

    await expect(page.locator('a[href="/entrar"]').first()).toBeAttached();
    await expect(page.locator('a[href="/criar-conta"]').first()).toBeAttached();

    await page.goto("/#funcionalidades");
    await expect(page.locator("#funcionalidades")).toBeInViewport();

    const comingSoon = page.getByText("Em breve");
    await expect(comingSoon.first()).toBeVisible();
    expect(await comingSoon.count()).toBeGreaterThanOrEqual(7);

    await expect(page.getByText("ao vivo", { exact: false })).toHaveCount(0);
    await expect(page.getByText("Quem decide")).toHaveCount(0);
  });

  test("final CTA and legal placeholders are reachable", async ({ page }) => {
    await page.goto("/");

    await page.goto("/#acompanhar");
    await expect(page.locator("#acompanhar")).toBeInViewport();

    await page.goto("/privacidade");
    await expect(
      page.getByRole("heading", { name: "Política de Privacidade" }),
    ).toBeVisible();
    await expect(page.getByText("Pendência documental")).toBeVisible();

    await page.goto("/contato");
    await expect(page.getByRole("heading", { name: "Contato" })).toBeVisible();
  });

  test("does not introduce horizontal overflow at key widths", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Width matrix is covered by the desktop project",
    );

    const widths = [320, 375, 390, 768, 1024, 1440];

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const hasOverflow = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1
        );
      });
      expect(hasOverflow, `overflow at ${width}px`).toBe(false);
    }
  });
});

test.describe("Arena onboarding entry", () => {
  test("Entrar route is reachable and protected app redirects", async ({
    page,
  }) => {
    await page.goto("/entrar");
    await expect(page.getByRole("heading", { name: /^Entrar$/i })).toBeVisible();
    await expect(page.getByLabel(/E-mail/i)).toBeVisible();

    await page.goto("/app/explorar");
    await expect(page).toHaveURL(/\/entrar/);
  });

  test("criar conta and protected create-team routes", async ({ page }) => {
    await page.goto("/criar-conta");
    await expect(
      page.getByRole("heading", { name: /Criar conta grátis/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/^Nome$/i)).toBeVisible();

    await page.goto("/app/criar-time");
    await expect(page).toHaveURL(/\/entrar/);
  });
});
