import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeamShield } from "@/components/app/TeamShield";

describe("TeamShield", () => {
  it("renders initials fallback when no logo is provided", () => {
    render(<TeamShield name="Sport Clube Recife" />);
    expect(screen.getByText("SR")).toBeInTheDocument();
  });

  it("renders a single-word name using its first two letters", () => {
    render(<TeamShield name="Flamengo" />);
    expect(screen.getByText("FL")).toBeInTheDocument();
  });

  it("renders the logo image when logoUrl is provided", () => {
    render(<TeamShield name="Sport Clube Recife" logoUrl="https://cdn.test/logo.png" />);
    const img = screen.getByAltText("Escudo do time Sport Clube Recife");
    expect(img).toHaveAttribute("src", "https://cdn.test/logo.png");
  });

  it("exposes the team name via title for long-name truncation contexts", () => {
    render(<TeamShield name="Associação Atlética Muito Comprida FC" />);
    expect(screen.getByTitle("Associação Atlética Muito Comprida FC")).toBeInTheDocument();
  });
});
