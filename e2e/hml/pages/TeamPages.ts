import { expect, Page } from "@playwright/test";
import { DemoUser } from "../helpers/demoUsers";

export class TeamPages {
  constructor(private readonly page: Page) {}

  async createTeamIfNeeded(user: DemoUser) {
    await this.page.goto("/app/meu-time");
    if (/\/entrar/i.test(this.page.url())) {
      throw new Error(
        "createTeamIfNeeded: redirected to /entrar — session missing after login.",
      );
    }
    const hasTeam = await this.page
      .getByRole("heading", { name: /^Meu time$/i })
      .waitFor({ state: "visible", timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (hasTeam) return;

    await this.page.goto("/app/criar-time");
    if (/\/entrar/i.test(this.page.url())) {
      throw new Error(
        "createTeamIfNeeded: /app/criar-time redirected to /entrar — session missing.",
      );
    }
    await expect(
      this.page.getByRole("heading", { name: /^Criar meu time$/i }),
    ).toBeVisible();
    await this.page.getByRole("textbox", { name: /Nome do time/i }).fill(user.teamName);
    await this.page.getByRole("combobox", { name: /Modalidade/i }).selectOption(user.modality);
    await this.page.getByRole("textbox", { name: /^Cidade$/i }).fill(user.city);
    await this.page.getByRole("textbox", { name: /UF/i }).fill(user.state);
    await this.page.getByRole("button", { name: /Criar time e continuar/i }).click();
    // Ignore Next.js route announcer alerts; only form errors use role=alert in main.
    const formError = this.page.locator("main [role='alert']");
    if (await formError.isVisible().catch(() => false)) {
      const text = (await formError.innerText()).trim();
      if (text) {
        throw new Error(`Falha UI ao criar time: ${text}`);
      }
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
