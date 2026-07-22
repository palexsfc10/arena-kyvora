/**
 * Soft, non-blocking location validation for Arena.
 *
 * These helpers only produce *hints* — subtle, informational warnings
 * intended for muted/amber UI treatments. They must NEVER be used to block
 * a form submission: bad city/UF data should still save, since the backend
 * remains the source of truth and discoverability is a soft feature.
 */

/** Official 2-letter Brazilian state (UF) codes. */
export const BR_UF_LIST = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

function isValidUf(value: string): boolean {
  return (BR_UF_LIST as readonly string[]).includes(value.trim().toUpperCase());
}

function isDigitsOnly(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

const MIN_CITY_LENGTH = 2;

/**
 * Soft hints about a city/region (UF) pair. Never throws, never blocks —
 * only returns human-readable strings meant for a muted/amber hint area.
 */
export function getCityHints(
  city: string | null | undefined,
  region: string | null | undefined,
): string[] {
  const hints: string[] = [];
  const trimmedCity = (city ?? "").trim();
  const trimmedRegion = (region ?? "").trim();

  if (trimmedRegion && !isValidUf(trimmedRegion)) {
    hints.push("UF inválida. Use a sigla de 2 letras de um estado brasileiro (ex.: SP, RJ, MG).");
  }

  if (trimmedCity) {
    if (isDigitsOnly(trimmedCity)) {
      hints.push("A cidade parece inválida (só números). Confira o nome digitado.");
    } else if (trimmedCity.length < MIN_CITY_LENGTH) {
      hints.push("O nome da cidade parece muito curto. Confira o que foi digitado.");
    } else if (
      trimmedRegion &&
      trimmedCity.toUpperCase() === trimmedRegion.toUpperCase()
    ) {
      hints.push("A cidade está igual à UF. Confira se os campos não foram trocados.");
    } else if (trimmedCity.length === 2 && isValidUf(trimmedCity)) {
      hints.push("A cidade parece ser a sigla de um estado, não um nome de cidade.");
    }
  }

  return hints;
}

/**
 * Hints shown when a team is "discoverable" (visible in Explorar). Wraps
 * getCityHints and adds a note that bad location data may hide the team
 * from regional searches — informational only, never blocking.
 */
export function getDiscoverableLocationHints(params: {
  city: string | null | undefined;
  state: string | null | undefined;
  discoverable: boolean;
}): string[] {
  const { city, state, discoverable } = params;
  if (!discoverable) return [];

  const trimmedCity = (city ?? "").trim();
  const hints = getCityHints(city, state);

  if (!trimmedCity) {
    hints.push(
      "Sem cidade definida: seu time pode não aparecer nas buscas regionais do Explorar.",
    );
  } else if (hints.length > 0) {
    hints.push(
      "Cidade ou UF podem estar incorretas e ocultar seu time nas buscas regionais do Explorar.",
    );
  }

  return hints;
}
