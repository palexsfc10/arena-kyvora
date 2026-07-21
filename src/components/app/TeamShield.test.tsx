import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { TeamShield } from "@/components/app/TeamShield";

describe("TeamShield", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders initials fallback when no logo is provided", () => {
    render(<TeamShield name="Sport Clube Recife" />);
    expect(screen.getByText("SR")).toBeInTheDocument();
  });

  it("renders a single-word name using its first two letters", () => {
    render(<TeamShield name="Flamengo" />);
    expect(screen.getByText("FL")).toBeInTheDocument();
  });

  it("renders the logo image when logoUrl is provided", () => {
    render(
      <TeamShield name="Sport Clube Recife" logoUrl="https://cdn.test/logo.png" />,
    );
    expect(
      screen.getByRole("img", { name: /Escudo do time Sport Clube Recife/i }),
    ).toHaveAttribute("src", "https://cdn.test/logo.png");
  });

  it("does not crash with missing name and shows fallback", () => {
    // @ts-expect-error intentional regression for absent name
    render(<TeamShield name={undefined} logoUrl={null} />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("updates image src when cache-bust query changes", () => {
    const { rerender, container } = render(
      <TeamShield name="Demo" logoUrl="https://cdn.test/logo.png?v=1" />,
    );
    expect(within(container).getByRole("img")).toHaveAttribute(
      "src",
      "https://cdn.test/logo.png?v=1",
    );
    rerender(<TeamShield name="Demo" logoUrl="https://cdn.test/logo.png?v=2" />);
    expect(within(container).getByRole("img")).toHaveAttribute(
      "src",
      "https://cdn.test/logo.png?v=2",
    );
  });

  it("falls back to initials when logo is removed", () => {
    const { rerender, container } = render(
      <TeamShield name="Demo FC" logoUrl="https://cdn.test/logo.png?v=1" />,
    );
    rerender(<TeamShield name="Demo FC" logoUrl={null} />);
    expect(within(container).queryByRole("img")).not.toBeInTheDocument();
    expect(within(container).getByText("DF")).toBeInTheDocument();
  });

  it("keeps a fixed shield box for long names", () => {
    render(<TeamShield name="Associação Atlética Muito Comprida FC" />);
    expect(screen.getByText("AF")).toBeInTheDocument();
  });
});
