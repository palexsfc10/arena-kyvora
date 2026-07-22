import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ExploreMobileTopPromo } from "@/components/app/ExploreMobileTopPromo";
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

describe("ExploreMobileTopPromo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearPromoDismissForTests("explore_mobile_top");
  });

  afterEach(() => {
    cleanup();
    clearPromoDismissForTests("explore_mobile_top");
  });

  it("renders compact copy and Acessar CTA with mobile UTMs", () => {
    render(<ExploreMobileTopPromo />);
    expect(screen.getByTestId("gestao-promo-explore-mobile-top")).toBeInTheDocument();
    expect(screen.getByText(/7 dias grátis/i)).toBeInTheDocument();
    const cta = screen.getByTestId("gestao-promo-cta-explore-mobile-top");
    expect(cta).toHaveAttribute("href", expect.stringContaining("utm_content=top_promo"));
    expect(cta).toHaveAttribute("href", expect.stringContaining("utm_campaign=mobile_explore"));
    expect(cta).toHaveAttribute("href", expect.stringContaining("utm_medium=app"));
    expect(trackEvent).toHaveBeenCalledWith(
      "kyvora_management_promo_viewed",
      expect.objectContaining({
        source: "explore_mobile_top",
        placement: "below_header",
        viewport: "mobile",
      }),
    );
  });

  it("dismisses for three days", () => {
    render(<ExploreMobileTopPromo />);
    fireEvent.click(screen.getByTestId("gestao-promo-dismiss-explore-mobile-top"));
    expect(screen.queryByTestId("gestao-promo-explore-mobile-top")).toBeNull();
    expect(trackEvent).toHaveBeenCalledWith(
      "kyvora_management_promo_dismissed",
      expect.objectContaining({ source: "explore_mobile_top" }),
    );
    const { unmount } = render(<ExploreMobileTopPromo />);
    expect(screen.queryByTestId("gestao-promo-explore-mobile-top")).toBeNull();
    unmount();
  });
});
