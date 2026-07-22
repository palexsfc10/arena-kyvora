import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/Header";

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

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

describe("Header landing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preserves brand and exposes Entrar CTA", () => {
    render(<Header />);
    expect(screen.getByLabelText(/Arena Kyvora/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^Entrar$/i }).length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /Criar conta grátis/i }).length,
    ).toBeGreaterThan(0);
  });
});
