import { expect, test } from "@playwright/test";
import {
  ensureArtifactDirs,
  isHml,
  shot,
  collectConsoleErrors,
} from "../helpers/artifacts";

test.describe("@hml public surfaces", () => {
  test.skip(!isHml, "HML-only suite");

  test("01 home, CTAs, Instagram, legal and protected redirect", async ({
    page,
  }, testInfo) => {
    ensureArtifactDirs();
    const errors = await collectConsoleErrors(page);
    await page.setViewportSize(
      testInfo.project.name.includes("mobile")
        ? { width: 390, height: 844 }
        : { width: 1440, height: 900 },
    );

    await page.goto("/");
    await expect(page).toHaveTitle(/Arena Kyvora/i);
    await expect(
      page.getByRole("heading", { level: 1, name: /Seu próximo jogo começa aqui/i }),
    ).toBeVisible();
    await shot(
      page,
      testInfo.project.name.includes("mobile") ? "10-mobile" : "01-publico",
      testInfo.project.name.includes("mobile")
        ? "01-home-mobile.png"
        : "01-home-desktop.png",
    );

    await expect(page.getByRole("link", { name: /Criar conta/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /^Entrar$/i }).first()).toBeVisible();

    const ig = page.getByRole("link", { name: /Instagram @arenakyvora/i });
    await expect(ig).toBeVisible();
    await expect(ig).toHaveAttribute("href", /instagram\.com\/arenakyvora/i);
    await shot(page, "01-publico", "02-footer-instagram.png");

    await page.goto("/#funcionalidades");
    await expect(page.locator("#funcionalidades")).toBeInViewport();
    await expect(page.getByText("Desafie outros times")).toBeVisible();

    await page.goto("/contato");
    await expect(page.getByRole("heading", { name: /Contato/i })).toBeVisible();
    await page.goto("/privacidade");
    await expect(page.getByRole("heading", { name: /Privacidade/i })).toBeVisible();
    await page.goto("/termos");
    await expect(page.getByRole("heading", { name: /Termos/i })).toBeVisible();

    await page.goto("/app/explorar");
    await expect(page).toHaveURL(/\/entrar/);
    await shot(page, "01-publico", "03-protegido-redirect-entrar.png");

    const severe = errors.filter(
      (e) =>
        !/favicon|third-party|ResizeObserver|RSC payload|Falling back to browser navigation|network error/i.test(
          e,
        ),
    );
    expect(severe, severe.join("\n")).toEqual([]);
  });

  test("02 cadastro validations without creating account", async ({ page }) => {
    await page.goto("/criar-conta");
    await shot(page, "02-cadastro", "01-formulario.png");
    await page.getByRole("button", { name: /Criar conta/i }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await shot(page, "02-cadastro", "02-validacao-vazia.png");

    await page.getByLabel(/^Nome$/i).fill("A");
    await page.getByLabel(/E-mail/i).fill("invalido");
    await page.getByLabel(/^Senha$/i).fill("123");
    await page.getByLabel(/Confirmar senha/i).fill("456");
    await page.getByRole("button", { name: /Criar conta/i }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await shot(page, "02-cadastro", "03-validacao-invalida.png");

    await page.goto("/entrar");
    await expect(page.getByRole("heading", { name: /^Entrar$/i })).toBeVisible();
    await page.goto("/esqueci-senha");
    await expect(page.getByRole("heading", { name: /senha/i })).toBeVisible();
    await shot(page, "02-cadastro", "04-esqueci-senha.png");
  });
});
