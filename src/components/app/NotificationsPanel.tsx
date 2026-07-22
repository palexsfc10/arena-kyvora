"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import * as arenaApi from "@/lib/arena-api";
import type { ArenaNotificationItem } from "@/lib/arena-types";
import { cn } from "@/lib/cn";

function formatRelative(dateIso: string): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Notifications popover.
 *
 * Mobile root cause (fixed): panel used `absolute right-0` + fixed `w-80`
 * relative to the bell, which sits LEFT of feedback/logout icons — so a
 * 320px panel overflowed the left viewport edge on phones.
 *
 * Strategy: on small screens, pin the panel to the viewport with safe
 * horizontal insets (`fixed left-3 right-3`). From `sm` up, keep the
 * classic absolute popover under the trigger.
 */
export function NotificationsPanel() {
  const { session, unreadNotifications, refreshNotifications } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ArenaNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const organizationId = session?.selected_organization_id ?? null;

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const data = await arenaApi.listNotifications(organizationId, {
        page_size: "10",
      });
      setItems(data?.items ?? []);
    } catch {
      // avisos são um extra; falhas silenciosas não devem travar a navegação
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function onNotificationClick(notification: ArenaNotificationItem) {
    if (!organizationId) return;
    if (!notification.read_at) {
      try {
        await arenaApi.markNotificationRead(organizationId, notification.id);
        setItems((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? { ...item, read_at: new Date().toISOString() }
              : item,
          ),
        );
        await refreshNotifications();
      } catch {
        // ignore
      }
    }
    setOpen(false);
  }

  if (!organizationId) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Avisos"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadNotifications > 0 ? (
          <span
            data-testid="notifications-unread-badge"
            className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-4 text-ink"
          >
            {unreadNotifications > 9 ? "9+" : unreadNotifications}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Avisos"
          data-testid="notifications-panel"
          className={cn(
            "z-50 rounded-lg border border-line bg-canvas p-2 shadow-lg",
            // Mobile: clamp to viewport safe margins (under sticky header h-14).
            "fixed left-3 right-3 top-14 mt-0 w-auto max-w-none",
            // sm+: classic popover aligned to the trigger, width capped by viewport.
            "sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-w-[min(24rem,calc(100vw-1.5rem))]",
          )}
        >
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <p className="min-w-0 truncate text-sm font-semibold text-ink">Avisos</p>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/app/desafios"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-ink-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Ver desafios
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Fechar avisos"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div
            data-testid="notifications-list"
            className="mt-1 max-h-[min(20rem,calc(100dvh-8rem))] overflow-x-hidden overflow-y-auto overscroll-contain"
          >
            {loading ? (
              <p className="px-2 py-3 text-sm text-muted" role="status">
                Carregando avisos…
              </p>
            ) : items.length === 0 ? (
              <p
                data-testid="notifications-empty"
                className="px-2 py-3 text-sm text-muted"
              >
                Nenhum aviso por aqui.
              </p>
            ) : (
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      data-testid="notification-item"
                      data-read={item.read_at ? "true" : "false"}
                      onClick={() => void onNotificationClick(item)}
                      className={cn(
                        "block w-full max-w-full rounded-md px-2 py-2 text-left text-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        !item.read_at && "bg-surface/60",
                      )}
                    >
                      <span className="flex items-start gap-2">
                        {!item.read_at ? (
                          <span
                            aria-hidden
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-deep"
                          />
                        ) : (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0" aria-hidden />
                        )}
                        <span className="min-w-0 flex-1 overflow-hidden">
                          <span className="block break-words font-medium text-ink">
                            {item.title}
                          </span>
                          <span className="block break-words text-ink-soft">
                            {item.body}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {formatRelative(item.created_at)}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
