import { expect, Page } from "@playwright/test";
import { requireE2ePassword } from "../helpers/demoUsers";

export class AuthPages {
  constructor(private readonly page: Page) {}

  async gotoRegister() {
    await this.page.goto("/criar-conta");
    await expect(
      this.page.getByRole("heading", { name: /Criar conta/i }),
    ).toBeVisible();
  }

  async gotoLogin() {
    await this.page.goto("/entrar");
    await expect(this.page.getByRole("heading", { name: /^Entrar$/i })).toBeVisible();
  }

  async fillRegister(opts: {
    name: string;
    email: string;
    acceptTerms?: boolean;
    password?: string;
  }) {
    const password = opts.password ?? requireE2ePassword();
    await this.page.getByLabel(/^Nome$/i).fill(opts.name);
    await this.page.getByLabel(/E-?mail/i).fill(opts.email);
    await this.page.locator("#password").fill(password);
    await this.page.locator("#confirm").fill(password);
    if (opts.acceptTerms !== false) {
      await this.page.getByRole("checkbox").check();
    }
  }

  async submitRegister() {
    await this.page.getByRole("button", { name: /Criar conta|Cadastrar/i }).click();
  }

  async login(email: string, password = requireE2ePassword()) {
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      await this.page.context().clearCookies();
      await this.page.goto("/entrar");
      await this.page.evaluate(() => {
        try {
          sessionStorage.clear();
          localStorage.clear();
        } catch {
          /* ignore */
        }
      });
      await this.page.goto("/entrar");
      await expect(this.page.getByRole("heading", { name: /^Entrar$/i })).toBeVisible();
      await this.page.getByLabel(/E-?mail/i).fill(email);
      await this.page.getByLabel(/^Senha$/i).fill(password);
      await this.page.getByRole("button", { name: /Entrar no Arena|^Entrar$/i }).click();
      const rateLimited = await this.page
        .getByText(/Muitas tentativas/i)
        .isVisible()
        .catch(() => false);
      if (rateLimited) {
        await this.page.waitForTimeout(20_000 * attempt);
        continue;
      }
      try {
        await this.expectLoggedIntoApp();
        return;
      } catch {
        const alertText = await this.page
          .getByRole("alert")
          .innerText()
          .catch(() => "");
        const url = this.page.url();
        if (attempt === 4) {
          throw new Error(
            `UI login failed after ${attempt} attempts (url=${url}; alert=${alertText || "none"}). Check ARENA_E2E_PASSWORD matches the demo accounts.`,
          );
        }
      }
    }
    throw new Error("Login bloqueado por rate-limit em HML após várias tentativas.");
  }

  async expectLoggedIntoApp() {
    await expect(this.page).toHaveURL(/\/app\//, { timeout: 30_000 });
    await expect(this.page.locator("header")).toBeVisible({ timeout: 15_000 });
    await expect(
      this.page.getByRole("button", { name: /avisos/i }),
    ).toBeVisible({ timeout: 15_000 });
  }

  async logout() {
    const accountMenu = this.page.getByTestId("header-account-menu");
    if (await accountMenu.isVisible().catch(() => false)) {
      await accountMenu.click();
      await this.page
        .getByTestId("header-account-menu-panel")
        .getByRole("menuitem", { name: /^Sair$/i })
        .click();
    } else {
      await this.page.getByRole("button", { name: /^Sair$/i }).click();
    }
    await expect(this.page).toHaveURL(/\/entrar|\/$/, { timeout: 20_000 });
  }
}
