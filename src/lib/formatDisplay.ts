/**
 * User-facing date/time/venue formatting for Arena (pt-BR).
 * Never surface ISO dates or HH:MM:SS to end users.
 */

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

/** Parse YYYY-MM-DD without timezone shift. */
export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** "30 de julho" or "30 de julho de 2026" when year differs from current. */
export function formatDisplayDate(
  value: string | null | undefined,
  opts: { includeYear?: boolean } = {},
): string {
  const date = parseDateOnly(value);
  if (!date) return value?.trim() || "";
  const day = date.getDate();
  const month = MONTHS_PT[date.getMonth()];
  const year = date.getFullYear();
  const includeYear =
    opts.includeYear ?? year !== new Date().getFullYear();
  return includeYear ? `${day} de ${month} de ${year}` : `${day} de ${month}`;
}

/** "6h" | "6h30" — strips seconds. */
export function formatDisplayTime(value: string | null | undefined): string {
  if (!value) return "";
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return value.trim();
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value.trim();
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${String(minutes).padStart(2, "0")}`;
}

/** "30 de julho, às 6h" */
export function formatDisplayDateTime(
  date: string | null | undefined,
  time: string | null | undefined,
): string {
  const d = formatDisplayDate(date);
  const t = formatDisplayTime(time);
  if (d && t) return `${d}, às ${t}`;
  return d || t;
}

export function formatPeriodLabel(period: string | null | undefined): string {
  const map: Record<string, string> = {
    morning: "Manhã",
    afternoon: "Tarde",
    evening: "Noite",
    flexible: "Horário flexível",
  };
  if (!period) return "";
  return map[period] ?? period;
}

/**
 * Venue copy for end users.
 * `yes` without description → "Com local" (not the ambiguous "Local disponível").
 * `to_arrange` / empty → "Local a definir".
 */
export function formatVenueLabel(
  venueOption: string | null | undefined,
  venueDescription?: string | null,
): string {
  const desc = venueDescription?.trim();
  if (desc) return desc;
  switch (venueOption) {
    case "yes":
      return "Com local";
    case "no":
      return "Sem local";
    case "to_arrange":
    default:
      return "Local a definir";
  }
}

/** Availability line: "Disponível em 22 de julho" (+ optional until). */
export function formatAvailabilityRange(
  from: string | null | undefined,
  until: string | null | undefined,
): string {
  const start = formatDisplayDate(from);
  if (!start) return "";
  const end = until && until !== from ? formatDisplayDate(until) : "";
  if (end) return `Disponível de ${start} a ${end}`;
  return `Disponível em ${start}`;
}
