import { describe, expect, it } from "vitest";
import {
  BR_UF_LIST,
  getCityHints,
  getDiscoverableLocationHints,
} from "@/lib/locationHints";

describe("BR_UF_LIST", () => {
  it("has exactly the 26 states + DF", () => {
    expect(BR_UF_LIST).toHaveLength(27);
    expect(BR_UF_LIST).toContain("SP");
    expect(BR_UF_LIST).toContain("DF");
  });
});

describe("getCityHints", () => {
  it("returns no hints for a valid city + UF", () => {
    expect(getCityHints("São Paulo", "SP")).toEqual([]);
    expect(getCityHints("Curitiba", "pr")).toEqual([]);
  });

  it("returns no hints when both city and region are empty", () => {
    expect(getCityHints("", "")).toEqual([]);
    expect(getCityHints(null, undefined)).toEqual([]);
  });

  it("warns about an invalid UF", () => {
    const hints = getCityHints("São Paulo", "São Paulo");
    expect(hints.some((h) => /UF inválida/i.test(h))).toBe(true);
  });

  it("warns about a UF that is not 2 letters", () => {
    const hints = getCityHints("São Paulo", "SPX");
    expect(hints.some((h) => /UF inválida/i.test(h))).toBe(true);
  });

  it("does not warn about UF case sensitivity", () => {
    expect(getCityHints("São Paulo", "sp")).toEqual([]);
  });

  it("warns when city is digits-only", () => {
    const hints = getCityHints("12345", "SP");
    expect(hints.some((h) => /números/i.test(h))).toBe(true);
  });

  it("warns when city is too short", () => {
    const hints = getCityHints("S", "SP");
    expect(hints.some((h) => /curto/i.test(h))).toBe(true);
  });

  it("warns when city equals region", () => {
    const hints = getCityHints("SP", "SP");
    expect(hints.some((h) => /igual à UF|sigla de um estado/i.test(h))).toBe(true);
  });

  it("warns when city looks like a UF code", () => {
    const hints = getCityHints("RJ", "SP");
    expect(hints.some((h) => /sigla de um estado/i.test(h))).toBe(true);
  });

  it("never throws for arbitrary input", () => {
    expect(() => getCityHints("", "")).not.toThrow();
    expect(() => getCityHints("💥", "??")).not.toThrow();
  });
});

describe("getDiscoverableLocationHints", () => {
  it("returns no hints when not discoverable, even with bad data", () => {
    expect(
      getDiscoverableLocationHints({ city: "", state: "", discoverable: false }),
    ).toEqual([]);
    expect(
      getDiscoverableLocationHints({
        city: "12345",
        state: "XX",
        discoverable: false,
      }),
    ).toEqual([]);
  });

  it("returns no hints when discoverable and location is valid", () => {
    expect(
      getDiscoverableLocationHints({
        city: "Belo Horizonte",
        state: "MG",
        discoverable: true,
      }),
    ).toEqual([]);
  });

  it("warns about missing city when discoverable", () => {
    const hints = getDiscoverableLocationHints({
      city: "",
      state: "MG",
      discoverable: true,
    });
    expect(hints.some((h) => /Sem cidade definida/i.test(h))).toBe(true);
  });

  it("warns that regional visibility may be hidden when city/UF looks wrong", () => {
    const hints = getDiscoverableLocationHints({
      city: "12345",
      state: "MG",
      discoverable: true,
    });
    expect(hints.some((h) => /ocultar seu time/i.test(h))).toBe(true);
  });

  it("never blocks submission — always returns a plain string array", () => {
    const hints = getDiscoverableLocationHints({
      city: undefined,
      state: undefined,
      discoverable: true,
    });
    expect(Array.isArray(hints)).toBe(true);
    hints.forEach((hint) => expect(typeof hint).toBe("string"));
  });
});
