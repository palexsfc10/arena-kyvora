import { expect, Page } from "@playwright/test";

export class ExplorePages {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto("/app/explorar");
    await expect(
      this.page.getByRole("heading", { name: /Explorar/i }),
    ).toBeVisible();
  }

  async filterByCity(city: string) {
    await this.page.locator('div:has(> span:text-is("Cidade")) input, label:has-text("Cidade") input').first().fill(city);
  }

  async filterByUf(uf: string) {
    await this.page.locator('div:has(> span:text-is("UF")) select, label:has-text("UF") select').first().selectOption(uf);
  }

  async applyFilters() {
    await this.page.getByRole("button", { name: /Filtrar|Buscar|Aplicar/i }).click().catch(async () => {
      await this.page.locator('form').first().evaluate((f) => (f as HTMLFormElement).requestSubmit());
    });
  }

  async clearFilters() {
    const clear = this.page.getByRole("button", { name: /Limpar/i });
    if (await clear.isVisible().catch(() => false)) {
      await clear.click();
    }
  }

  async challengeFirstVisibleTeam(opts: {
    date: string;
    time?: string;
    phone: string;
  }) {
    const challengeBtn = this.page.getByRole("button", { name: /Desafiar/i }).first();
    await expect(challengeBtn).toBeVisible({ timeout: 25_000 });
    await challengeBtn.click();
    await this.page.locator('input[type="date"]').fill(opts.date);
    const timeInput = this.page.locator('input[type="time"]');
    if (await timeInput.count()) {
      await timeInput.fill(opts.time ?? "20:00");
    }
    const phone = this.page.getByLabel(/Telefone|WhatsApp|Contato/i).or(
      this.page.locator('input[type="tel"], input[name*="phone"]'),
    );
    await phone.first().fill(opts.phone);
    await this.page.getByRole("button", { name: /Enviar desafio|Enviar|Confirmar/i }).click();
  }
}
