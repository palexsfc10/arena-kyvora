import { expect, Page } from "@playwright/test";

export class ChallengesPages {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto("/app/desafios");
    await expect(this.page.getByRole("heading", { name: /Desafios/i })).toBeVisible();
  }

  async selectTab(name: RegExp | string) {
    await this.page.getByRole("tab", { name }).click();
  }

  async acceptFirstPending() {
    await this.selectTab(/Recebidos/i);
    const accept = this.page.getByRole("button", { name: /Aceitar/i }).first();
    await expect(accept).toBeVisible({ timeout: 25_000 });
    await accept.click();
    await expect(
      this.page.getByText(/aceito|confirmado|sucesso/i).first(),
    ).toBeVisible({ timeout: 20_000 });
  }
}
