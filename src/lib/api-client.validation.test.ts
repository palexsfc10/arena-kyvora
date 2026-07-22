import { describe, expect, it } from "vitest";
import { ApiError, composeApiErrorMessage } from "@/lib/api-client";

describe("composeApiErrorMessage", () => {
  it("prefers field details over generic validation message", () => {
    const message = composeApiErrorMessage("Erro de validação.", [
      { field: "body", message: "A mensagem precisa ter pelo menos 10 caracteres." },
    ]);
    expect(message).toBe("A mensagem precisa ter pelo menos 10 caracteres.");
    expect(new ApiError(message, 422, "VALIDATION_ERROR").message).toBe(message);
  });

  it("keeps rate-limit message intact", () => {
    const message = composeApiErrorMessage(
      "Muitas tentativas de cadastro neste horário. Aguarde alguns minutos e tente novamente.",
    );
    expect(message).toContain("cadastro");
  });
});
