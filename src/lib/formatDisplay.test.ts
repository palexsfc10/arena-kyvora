import { describe, expect, it } from "vitest";
import {
  formatAvailabilityRange,
  formatDisplayDate,
  formatDisplayDateTime,
  formatDisplayTime,
  formatVenueLabel,
} from "@/lib/formatDisplay";

describe("formatDisplay", () => {
  it("formats date without ISO", () => {
    expect(formatDisplayDate("2026-07-30", { includeYear: true })).toBe(
      "30 de julho de 2026",
    );
  });

  it("formats time without seconds", () => {
    expect(formatDisplayTime("06:00:00")).toBe("6h");
    expect(formatDisplayTime("20:30:00")).toBe("20h30");
  });

  it("formats date+time for next match", () => {
    expect(formatDisplayDateTime("2026-07-30", "06:00:00")).toContain("às 6h");
    expect(formatDisplayDateTime("2026-07-30", "06:00:00")).not.toContain(":00:00");
  });

  it("maps venue without ambiguous Local disponível", () => {
    expect(formatVenueLabel("yes")).toBe("Com local");
    expect(formatVenueLabel("to_arrange")).toBe("Local a definir");
    expect(formatVenueLabel("yes", "Ginásio Municipal")).toBe("Ginásio Municipal");
  });

  it("formats availability range", () => {
    expect(formatAvailabilityRange("2026-07-22", null)).toMatch(/Disponível em/);
    expect(formatAvailabilityRange("2026-07-22", null)).not.toMatch(/2026-07-22/);
  });
});
