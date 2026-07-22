import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ManagementPromo } from "@/components/app/ManagementPromo";
import { clearPromoDismissForTests } from "@/lib/promoPrefs";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("@/config/env", () => ({
  env: {
    gestaoUrl: "https://hml.kyvoraapp.com.br",
  },
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ManagementPromo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearPromoDismissForTests("login");
    clearPromoDismissForTests("explore");
    clearPromoDismissForTests("my_team");
  });

  afterEach(() => {
    cleanup();
    clearPromoDismissForTests("login");
    clearPromoDismissForTests("explore");
    clearPromoDismissForTests("my_team");
  });

  it("renders login variant with CTA and tracks view once", () => {
    render(<ManagementPromo variant="login" />);
    expect(screen.getByTestId("gestao-promo-login")).toBeInTheDocument();
    expect(screen.getByTestId("gestao-promo-cta-login")).toHaveAttribute(
      "href",
      expect.stringContaining("utm_content=login"),
    );
    expect(trackEvent).toHaveBeenCalledWith("kyvora_management_promo_viewed", {
      source: "login",
      origin: "arena",
    });
  });

  it("dismisses explore promo and tracks dismiss", () => {
    render(<ManagementPromo variant="explore" />);
    fireEvent.click(screen.getByTestId("gestao-promo-dismiss"));
    expect(screen.queryByTestId("gestao-promo-card")).toBeNull();
    expect(trackEvent).toHaveBeenCalledWith("kyvora_management_promo_dismissed", {
      source: "explore",
      origin: "arena",
    });
  });

  it("renders my_team benefits copy", () => {
    render(<ManagementPromo variant="my_team" />);
    expect(screen.getByText(/administrar seu time por completo/i)).toBeInTheDocument();
    expect(screen.getByText(/mensalidades e despesas/i)).toBeInTheDocument();
    expect(screen.getByTestId("gestao-promo-cta-my_team")).toBeInTheDocument();
  });

  it("does not show login promo again in the same session after view", () => {
    const { unmount } = render(<ManagementPromo variant="login" />);
    expect(screen.getByTestId("gestao-promo-login")).toBeInTheDocument();
    unmount();
    render(<ManagementPromo variant="login" />);
    expect(screen.queryByTestId("gestao-promo-login")).toBeNull();
  });
});
