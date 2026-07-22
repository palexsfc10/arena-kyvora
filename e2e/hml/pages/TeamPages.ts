import { expect, Page } from "@playwright/test";
import { DemoUser } from "../helpers/demoUsers";

export class TeamPages {
  constructor(private readonly page: Page) {}

  async createTeamIfNeeded(user: DemoUser) {
    await this.page.goto("/app/meu-time");
    const hasTeam = await this.page
      .getByRole("heading", { name: /^Meu time$/i })
      .isVisible()
      .catch(() => false);
    if (hasTeam) return;

    await this.page.goto("/app/criar-time");
    await expect(
      this.page.getByRole("heading", { name: /^Criar meu time$/i }),
    ).toBeVisible();
    await this.page.getByRole("textbox", { name: /Nome do time/i }).fill(user.teamName);
    await this.page.getByRole("combobox", { name: /Modalidade/i }).selectOption(user.modality);
    await this.page.getByRole("textbox", { name: /^Cidade$/i }).fill(user.city);
    await this.page.getByRole("textbox", { name: /UF/i }).fill(user.state);
    await this.page.getByRole("button", { name: /Criar time e continuar/i }).click();
    const err = this.page.getByRole("alert");
    if (await err.isVisible().catch(() => false)) {
      throw new Error(`Falha UI ao criar time: ${await err.innerText()}`);
    }
    await expect(
      this.page.getByRole("heading", { name: /^Criar meu time$/i }),
    ).toBeHidden({ timeout: 45_000 });
  }

  async openMeuTime() {
    await this.page.goto("/app/meu-time");
    await expect(
      this.page.getByRole("heading", { name: /^Meu time$/i }),
    ).toBeVisible({ timeout: 20_000 });
  }

  async openDisponibilidades() {
    await this.page.goto("/app/disponibilidades");
    await expect(
      this.page.getByRole("heading", { name: /disponibilidades/i }),
    ).toBeVisible();
  }

  async publishAvailability(city: string, state: string, availableFrom: string) {
    await this.openDisponibilidades();
    await this.page.locator('label:has-text("Cidade") input').fill(city);
    await this.page
      .locator('label:has-text("Região") input, label:has-text("UF") input')
      .fill(state);
    await this.page.locator('input[type="date"]').first().fill(availableFrom);
    await this.page.getByRole("button", { name: /Publicar/i }).click();
    await expect(this.page.getByText(/Disponibilidade publicada/i)).toBeVisible({
      timeout: 20_000,
    });
  }
}
