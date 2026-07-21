"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  CalendarPlus,
  Compass,
  LogOut,
  Swords,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/ui/Container";
import { brand } from "@/content/site";
import { env } from "@/config/env";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import {
  buildGestaoManagementUrl,
  gestaoDestinationLabel,
} from "@/lib/gestao-cta";

const navItems = [
  { href: "/app/explorar", label: "Explorar", icon: Compass, mobile: true },
  {
    href: "/app/disponibilidades",
    label: "Disponibilidades",
    short: "Publicar",
    icon: CalendarPlus,
    mobile: true,
  },
  { href: "/app/desafios", label: "Desafios", icon: Swords, mobile: true },
  { href: "/app/meu-time", label: "Meu time", icon: UsersRound, mobile: true },
];

function trackGestaoCta(viewport: "desktop" | "mobile") {
  try {
    trackEvent("arena_kyvora_cta_clicked", {
      placement: "authenticated_header",
      viewport,
      destination: gestaoDestinationLabel(env.gestaoUrl),
    });
  } catch {
    // Analytics must never block navigation.
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const { status, session, selectedTeam, pendingReceived, logout, error, refreshSession } =
    useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const gestaoHref = buildGestaoManagementUrl(env.gestaoUrl);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/entrar?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  useEffect(() => {
    if (status !== "authenticated" || !session) return;
    if (
      pathname === "/app/sem-time" ||
      pathname === "/app/selecionar-time" ||
      pathname === "/app/criar-time" ||
      pathname === "/app/ativar-participacao"
    ) {
      return;
    }
    if (session.teams.length === 0) {
      router.replace("/app/criar-time");
      return;
    }
    if (session.teams.length > 1 && !session.selected_organization_id) {
      router.replace("/app/selecionar-time");
      return;
    }
    const selected = session.teams.find(
      (t) => t.organization_id === session.selected_organization_id,
    );
    if (
      selected &&
      !selected.arena_enabled &&
      selected.can_manage &&
      pathname.startsWith("/app/explorar")
    ) {
      // Allow browse; activation is prompted from dedicated page via login routing
    }
  }, [status, session, pathname, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas px-4">
        <p className="text-sm text-muted" role="status">
          Carregando sessão…
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-4 text-center">
        <p className="text-ink">{error ?? "Erro ao carregar a sessão."}</p>
        <button
          type="button"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ink"
          onClick={() => void refreshSession()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas px-4">
        <p className="text-sm text-muted" role="status">
          Redirecionando…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-canvas pb-24 lg:pb-8">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/95 backdrop-blur-md">
        <Container className="flex h-14 items-center justify-between gap-2 sm:gap-3">
          <Link
            href="/app/explorar"
            className="shrink-0 font-display text-base font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={`${brand.shortName} by ${brand.ecosystem} — início`}
          >
            <span>{brand.shortName}</span>
            <span className="ml-1.5 text-[11px] font-medium tracking-wide text-muted">
              by {brand.ecosystem}
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Área interna"
          >
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active ? "bg-surface text-ink" : "text-muted hover:text-ink",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                  {item.href === "/app/desafios" && pendingReceived > 0 ? (
                    <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-ink">
                      {pendingReceived}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            {gestaoHref ? (
              <>
                <a
                  href={gestaoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cta-viewport="desktop"
                  className="hidden min-h-10 items-center rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-ink/30 hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:inline-flex"
                  onClick={() => trackGestaoCta("desktop")}
                >
                  Gerencie seu time no Kyvora
                </a>
                <a
                  href={gestaoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cta-viewport="mobile"
                  className="inline-flex min-h-10 shrink-0 items-center rounded-md border border-line px-2 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
                  aria-label="Gerencie seu time no Kyvora"
                  onClick={() => trackGestaoCta("mobile")}
                >
                  Abrir Kyvora
                </a>
              </>
            ) : null}

            {selectedTeam ? (
              <Link
                href="/app/selecionar-time"
                className="max-w-[7rem] truncate rounded-md border border-line px-2 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:max-w-[12rem] md:max-w-[14rem]"
                title={selectedTeam.name}
              >
                {selectedTeam.name}
              </Link>
            ) : null}

            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </Container>
      </header>

      <main id="conteudo-principal">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        aria-label="Navegação móvel"
      >
        <ul className="grid grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
                    active ? "text-ink" : "text-muted",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="relative">
                    <Icon className="h-5 w-5" aria-hidden />
                    {item.href === "/app/desafios" && pendingReceived > 0 ? (
                      <span className="absolute -right-2 -top-1 h-2 w-2 rounded-full bg-accent-deep" />
                    ) : null}
                  </span>
                  {item.short ?? item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
