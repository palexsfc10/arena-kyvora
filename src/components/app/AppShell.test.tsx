import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AppShell } from "@/components/app/AppShell";
import { GESTAO_CTA_UTM } from "@/lib/gestao-cta";
import { trackEvent } from "@/lib/analytics";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/app/explorar",
  useRouter: () => ({ replace }),
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

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("@/config/env", () => ({
  env: {
    gestaoUrl: "https://hml.kyvoraapp.com.br",
  },
}));

vi.mock("@/lib/arena-api", () => ({
  listNotifications: vi.fn().mockResolvedValue({
    items: [],
    page: 1,
    page_size: 10,
    total: 0,
    has_more: false,
    unread_count: 0,
  }),
  markNotificationRead: vi.fn(),
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    status: "authenticated",
    session: {
      teams: [
        {
          organization_id: "org-1",
          name: "demo FC",
          logo_url: null,
          arena_enabled: true,
          can_manage: true,
        },
      ],
      selected_organization_id: "org-1",
    },
    selectedTeam: {
      organization_id: "org-1",
      name: "demo FC",
      logo_url: null,
      arena_enabled: true,
      can_manage: true,
    },
    pendingReceived: 0,
    unreadNotifications: 0,
    logout: vi.fn(),
    error: null,
    refreshSession: vi.fn(),
    refreshNotifications: vi.fn(),
  }),
}));

describe("AppShell authenticated shell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows Arena by Kyvora branding", () => {
    render(
      <AppShell>
        <p>conteudo</p>
      </AppShell>,
    );

    expect(
      screen.getByRole("link", { name: /Arena by Kyvora — início/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("by Kyvora")).toBeInTheDocument();
  });

  it("uses a discrete header Gestão link and no sticky mobile promo banner", () => {
    render(
      <AppShell>
        <p>conteudo</p>
      </AppShell>,
    );

    expect(document.querySelector("aside")).toBeNull();

    const desktop = document.querySelector(
      'a[data-cta-viewport="desktop"]',
    ) as HTMLAnchorElement | null;
    const mobileHeader = document.querySelector(
      'a[data-cta-viewport="mobile"]',
    ) as HTMLAnchorElement | null;

    expect(desktop).toBeTruthy();
    expect(mobileHeader).toBeTruthy();
    expect(desktop?.closest("header")).toBeTruthy();
    expect(mobileHeader?.closest("header")).toBeTruthy();
    expect(desktop?.textContent).toContain("Gestão de Times");
    expect(mobileHeader?.textContent).toMatch(/Gestão/);
    expect(desktop?.textContent).not.toContain("Teste 7 dias");
    expect(desktop?.textContent).not.toContain("Teste grátis");

    expect(desktop).toHaveAttribute("target", "_blank");
    expect(desktop).toHaveAttribute("rel", "noopener noreferrer");
    const href = desktop!.getAttribute("href") ?? "";
    expect(href.startsWith("https://hml.kyvoraapp.com.br")).toBe(true);
    expect(href).toContain(`utm_source=${GESTAO_CTA_UTM.source}`);

    expect(screen.getByTestId("mobile-bottom-nav")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Time atual: demo FC/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("header-account-menu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Sair$/i })).toBeInTheDocument();
    expect(mobileHeader?.className).toMatch(/rounded-full|bg-sky/);
  });

  it("tracks header Gestão CTA with generic params only", () => {
    render(
      <AppShell>
        <p>conteudo</p>
      </AppShell>,
    );

    fireEvent.click(
      document.querySelector('a[data-cta-viewport="desktop"]') as HTMLAnchorElement,
    );
    expect(trackEvent).toHaveBeenCalledWith("kyvora_management_promo_clicked", {
      source: "header",
      origin: "arena",
    });
    expect(trackEvent).toHaveBeenCalledWith("paid_kyvora_cta_clicked", {
      placement: "authenticated_header",
      viewport: "desktop",
      origin: "arena",
    });
  });

  it("keeps CTA keyboard-focusable", () => {
    render(
      <AppShell>
        <p>conteudo</p>
      </AppShell>,
    );
    const desktop = document.querySelector(
      'a[data-cta-viewport="desktop"]',
    ) as HTMLAnchorElement;
    desktop.focus();
    expect(document.activeElement).toBe(desktop);
  });

  it("tracks CTA click without blocking navigation when analytics throws", () => {
    vi.mocked(trackEvent).mockImplementationOnce(() => {
      throw new Error("analytics down");
    });

    render(
      <AppShell>
        <p>conteudo</p>
      </AppShell>,
    );

    const desktop = document.querySelector(
      'a[data-cta-viewport="desktop"]',
    ) as HTMLAnchorElement;
    expect(() => fireEvent.click(desktop)).not.toThrow();
    expect(desktop.getAttribute("href")).toContain("https://hml.kyvoraapp.com.br");
  });

  it("shows an Enviar sugestão link pointing to the feedback page", () => {
    render(
      <AppShell>
        <p>conteudo</p>
      </AppShell>,
    );

    const link = screen.getByRole("link", { name: /Enviar sugestão/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/app/feedback");
  });

  it("does not render CTA that creates org, trial, subscription or checkout", () => {
    render(
      <AppShell>
        <p>conteudo</p>
      </AppShell>,
    );

    const href =
      (
        document.querySelector(
          'a[data-cta-viewport="desktop"]',
        ) as HTMLAnchorElement
      ).getAttribute("href") ?? "";
    expect(href).not.toMatch(/checkout|billing|trial|subscribe|assinatura/i);
  });
});
