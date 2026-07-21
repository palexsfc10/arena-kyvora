"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
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

export function NotificationsPanel() {
  const { session, unreadNotifications, refreshNotifications } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ArenaNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const organizationId = session?.selected_organization_id ?? null;

  const load = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const data = await arenaApi.listNotifications(organizationId, {
        page_size: "10",
      });
      setItems(data.items);
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
    function onClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
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
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadNotifications > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-4 text-ink">
            {unreadNotifications > 9 ? "9+" : unreadNotifications}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Avisos"
          className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[90vw] rounded-lg border border-line bg-canvas p-2 shadow-lg sm:w-96"
        >
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-sm font-semibold text-ink">Avisos</p>
            <Link
              href="/app/desafios"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-ink-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Ver desafios
            </Link>
          </div>

          <div className="mt-1 max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-2 py-3 text-sm text-muted" role="status">
                Carregando avisos…
              </p>
            ) : items.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted">Nenhum aviso por aqui.</p>
            ) : (
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => void onNotificationClick(item)}
                      className={cn(
                        "block w-full rounded-md px-2 py-2 text-left text-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        !item.read_at && "bg-surface/60",
                      )}
                    >
                      <span className="flex items-start gap-2">
                        {!item.read_at ? (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-deep" />
                        ) : (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0" />
                        )}
                        <span className="min-w-0">
                          <span className="block font-medium text-ink">{item.title}</span>
                          <span className="block text-ink-soft">{item.body}</span>
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
