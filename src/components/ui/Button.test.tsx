import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComingSoonBadge } from "@/components/ui/ComingSoonBadge";
import { Button } from "@/components/ui/Button";

describe("UI primitives", () => {
  it("renders the coming soon badge", () => {
    render(<ComingSoonBadge />);
    expect(screen.getByText("Em breve")).toBeInTheDocument();
  });

  it("renders button as link when href is provided", () => {
    render(
      <Button href="#funcionalidades">Conhecer funcionalidades</Button>,
    );
    const link = screen.getByRole("link", {
      name: "Conhecer funcionalidades",
    });
    expect(link).toHaveAttribute("href", "#funcionalidades");
  });
});
