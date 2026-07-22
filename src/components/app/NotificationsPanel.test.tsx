import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NotificationsPanel } from "@/components/app/NotificationsPanel";

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

const listNotifications = vi.fn();
const markNotificationRead = vi.fn();
const refreshNotifications = vi.fn();

vi.mock("@/lib/arena-api", () => ({
  listNotifications: (...args: unknown[]) => listNotifications(...args),
  markNotificationRead: (...args: unknown[]) => markNotificationRead(...args),
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    session: { selected_organization_id: "org-1" },
    unreadNotifications: 2,
    refreshNotifications,
  }),
}));

describe("NotificationsPanel", () => {
  beforeEach(() => {
    listNotifications.mockReset();
    markNotificationRead.mockReset();
    refreshNotifications.mockReset();
    listNotifications.mockResolvedValue({
      items: [],
      page: 1,
      page_size: 10,
      total: 0,
      has_more: false,
      unread_count: 0,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders empty state and closes with explicit button", async () => {
    render(<NotificationsPanel />);
    fireEvent.click(screen.getByRole("button", { name: /avisos/i }));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-empty")).toBeInTheDocument();
    });
    expect(screen.getByTestId("notifications-panel").className).toMatch(/fixed/);
    fireEvent.click(screen.getByRole("button", { name: /fechar avisos/i }));
    expect(screen.queryByTestId("notifications-panel")).not.toBeInTheDocument();
  });

  it("shows unread badge", () => {
    render(<NotificationsPanel />);
    expect(screen.getByTestId("notifications-unread-badge")).toHaveTextContent("2");
  });

  it("closes on Escape", async () => {
    render(<NotificationsPanel />);
    fireEvent.click(screen.getByRole("button", { name: /avisos/i }));
    await waitFor(() => {
      expect(screen.getByTestId("notifications-panel")).toBeInTheDocument();
    });
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByTestId("notifications-panel")).not.toBeInTheDocument();
    });
  });
});
