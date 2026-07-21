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

describe("AppShell authenticated header", () => {
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

  it("exposes Gestão CTA from env.gestaoUrl with UTMs and safe attributes", () => {
    render(
      <AppShell>
        <p>conteudo</p>
      </AppShell>,
    );

    const desktop = document.querySelector(
      'a[data-cta-viewport="desktop"]',
    ) as HTMLAnchorElement | null;
    const mobile = document.querySelector(
      'a[data-cta-viewport="mobile"]',
    ) as HTMLAnchorElement | null;

    expect(desktop).toBeTruthy();
    expect(mobile).toBeTruthy();
    expect(mobile?.textContent).toContain("Abrir Kyvora");
    expect(desktop?.textContent).toContain("Gerencie seu time no Kyvora");

    for (const link of [desktop!, mobile!]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      const href = link.getAttribute("href") ?? "";
      expect(href.startsWith("https://hml.kyvoraapp.com.br")).toBe(true);
      expect(href).toContain(`utm_source=${GESTAO_CTA_UTM.source}`);
      expect(href).toContain(`utm_medium=${GESTAO_CTA_UTM.medium}`);
      expect(href).toContain(`utm_campaign=${GESTAO_CTA_UTM.campaign}`);
      expect(href).toContain(`utm_content=${GESTAO_CTA_UTM.content}`);
      expect(href).not.toMatch(/localhost|token|email|Bearer/i);
    }

    expect(screen.getByRole("link", { name: /demo FC/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sair/i })).toBeInTheDocument();
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
    expect(desktop).toBeTruthy();
    expect(() => fireEvent.click(desktop)).not.toThrow();
    expect(desktop.getAttribute("href")).toContain("https://hml.kyvoraapp.com.br");
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
