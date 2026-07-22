import { expect, test } from "@playwright/test";
import { requireE2ePassword } from "./helpers/demoUsers";

const API = process.env.PLAYWRIGHT_API_BASE_URL ?? "https://hml-api.kyvoraapp.com.br";
const ACCESS_TOKEN_KEY = "arena_kyvora_access_token";

async function registerAndLogin(): Promise<{ email: string; token: string }> {
  const stamp = Date.now();
  const email = `qa.ui.${stamp}@example.com`;
  const password = requireE2ePassword();

  const reg = await fetch(`${API}/api/v1/arena/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      name: "QA UI Tester",
      email,
      password,
      confirm_password: password,
      accept_terms: true,
    }),
  });
  expect(reg.status, `register status ${reg.status}`).toBe(201);

  const login = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  expect(login.status, `login status ${login.status}`).toBe(200);
  const json = (await login.json()) as {
    data?: { access_token?: string };
  };
  const token = json.data?.access_token;
  expect(token).toBeTruthy();
  return { email, token: token! };
}

test.describe("HML QA — feedback + cadastro (full)", () => {
  test("cadastro UI has no rate-limit error and accepts submit", async ({
    page,
  }) => {
    const stamp = Date.now();
    const email = `qa.cadastro.${stamp}@example.com`;
    const password = requireE2ePassword();

    await page.goto("/criar-conta");
    await expect(page.getByRole("heading", { name: /criar conta/i })).toBeVisible();
    await page.getByLabel(/^nome$/i).fill("QA Cadastro");
    await page.getByLabel(/e-mail/i).fill(email);
    await page.getByLabel(/^senha$/i).fill(password);
    await page.getByLabel(/confirmar senha/i).fill(password);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /criar conta/i }).click();

    await expect(
      page.getByText(/excedeu tentativas|muitas tentativas de cadastro/i),
    ).toHaveCount(0);
    await expect(page).toHaveURL(/verificacao-pendente/, { timeout: 20_000 });
  });

  test("feedback client validation + successful submit", async ({ page }) => {
    const { token } = await registerAndLogin();

    await page.addInitScript(
      ([key, value]) => {
        sessionStorage.setItem(key, value);
      },
      [ACCESS_TOKEN_KEY, token] as [string, string],
    );

    await page.goto("/app/feedback");
    await expect(page.getByRole("heading", { name: /enviar sugest/i })).toBeVisible({
      timeout: 20_000,
    });

    const subject = page.getByPlaceholder(/resuma em poucas palavras/i);
    const body = page.getByPlaceholder(/descreva com o máximo/i);

    await subject.fill("Ok");
    await body.fill("curto");
    await page.getByRole("button", { name: /^enviar$/i }).click();
    await expect(
      page.getByText(/mensagem precisa ter pelo menos 10 caracteres/i),
    ).toBeVisible();

    // Re-query after validation re-render (aria-describedby swap detaches nodes).
    const subject2 = page.getByPlaceholder(/resuma em poucas palavras/i);
    const body2 = page.getByPlaceholder(/descreva com o m/i);
    await subject2.fill("Sugestao de UI");
    await body2.fill(
      "Mensagem com comprimento adequado para passar na validacao do formulario.",
    );
    await page.getByRole("button", { name: /^enviar$/i }).click();
    await expect(page.getByText(/mensagem enviada/i)).toBeVisible({
      timeout: 20_000,
    });
  });
});
