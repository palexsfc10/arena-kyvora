import { expect, test } from "@playwright/test";

test.describe("HML QA — feedback + cadastro", () => {
  test("cadastro page loads without rate-limit banner by default", async ({
    page,
  }) => {
    await page.goto("/criar-conta");
    await expect(page.getByRole("heading", { name: /criar conta/i })).toBeVisible();
    await expect(page.getByText(/excedeu tentativas|muitas tentativas/i)).toHaveCount(0);
  });

  test("feedback rejects short message client-side", async ({ page }) => {
    // Unauthenticated users may be redirected; still assert client copy when form is present.
    await page.goto("/app/feedback");
    const subject = page.getByLabel(/assunto/i);
    if (!(await subject.count())) {
      test.skip(true, "Feedback form requires auth session in this environment");
    }
    await subject.fill("Ok");
    await page.getByLabel(/mensagem/i).fill("curto");
    await page.getByRole("button", { name: /enviar/i }).click();
    await expect(
      page.getByText(/mensagem precisa ter pelo menos 10 caracteres/i),
    ).toBeVisible();
  });
});
