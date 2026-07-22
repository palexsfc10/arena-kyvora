import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearPromoDismissForTests,
  dismissPromo,
  isPromoDismissed,
  markHighlightShownThisSession,
  wasHighlightShownThisSession,
} from "@/lib/promoPrefs";

describe("promoPrefs", () => {
  beforeEach(() => {
    clearPromoDismissForTests("login");
    clearPromoDismissForTests("explore");
    clearPromoDismissForTests("explore_mobile_top");
    clearPromoDismissForTests("my_team");
  });

  afterEach(() => {
    clearPromoDismissForTests("login");
    clearPromoDismissForTests("explore");
    clearPromoDismissForTests("explore_mobile_top");
    clearPromoDismissForTests("my_team");
  });

  it("starts undismissed", () => {
    expect(isPromoDismissed("login")).toBe(false);
    expect(isPromoDismissed("explore")).toBe(false);
  });

  it("dismisses for the cooldown window", () => {
    dismissPromo("explore", 60_000);
    expect(isPromoDismissed("explore")).toBe(true);
    expect(isPromoDismissed("login")).toBe(false);
  });

  it("tracks high-emphasis once per session", () => {
    expect(wasHighlightShownThisSession()).toBe(false);
    markHighlightShownThisSession();
    expect(wasHighlightShownThisSession()).toBe(true);
  });

  it("dismisses explore_mobile_top independently", () => {
    dismissPromo("explore_mobile_top", 60_000);
    expect(isPromoDismissed("explore_mobile_top")).toBe(true);
    expect(isPromoDismissed("explore")).toBe(false);
  });
});
