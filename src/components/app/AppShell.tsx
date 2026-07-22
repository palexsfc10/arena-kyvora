"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CalendarPlus,
  Compass,
  LogOut,
  MessageSquarePlus,
  MoreVertical,
  Swords,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/ui/Container";
import { NotificationsPanel } from "@/components/app/NotificationsPanel";
import { TeamShield } from "@/components/app/TeamShield";
import { brand } from "@/content/site";
import { env } from "@/config/env";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { buildGestaoManagementUrl } from "@/lib/gestao-cta";

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
    trackEvent("kyvora_management_promo_clicked", {
      source: viewport === "mobile" ? "header_mobile" : "header",
      origin: "arena",
    });
    trackEvent("paid_kyvora_cta_clicked", {
      placement: "authenticated_header",
      viewport,
      origin: "arena",
    });
  } catch {
    // Analytics must never block navigation.
  }
}

const gestaoChipClass =
  "inline-flex min-h-9 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-2.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function AppShell({ children }: { children: ReactNode }) {
  const { status, session, selectedTeam, pendingReceived, logout, error, refreshSession } =
    useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const gestaoHref = buildGestaoManagementUrl(env.gestaoUrl);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

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
      pathname === "/app/ativar-participacao" ||
      pathname === "/app/feedback"
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
  }, [status, session, pathname, router]);

  useEffect(() => {
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (accountRef.current && target && !accountRef.current.contains(target)) {
        setAccountOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

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
    <div className="min-h-dvh bg-canvas pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-8">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/95 backdrop-blur-md">
        <Container className="flex h-14 min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/app/explorar"
              className="min-w-0 shrink font-display text-base font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`${brand.shortName} by ${brand.ecosystem} — início`}
            >
              <span>{brand.shortName}</span>
              <span className="ml-1.5 text-[11px] font-medium tracking-wide text-muted">
                by {brand.ecosystem}
              </span>
            </Link>

            {gestaoHref ? (
              <>
                <a
                  href={gestaoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cta-viewport="desktop"
                  data-cta="paid-kyvora"
                  data-cta-variant="header"
                  data-testid="gestao-header-cta"
                  className={cn(gestaoChipClass, "hidden lg:inline-flex")}
                  onClick={() => trackGestaoCta("desktop")}
                  aria-label={`${brand.gestaoName} (abre em nova aba)`}
                >
                  Gestão de Times
                </a>
                <a
                  href={gestaoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cta-viewport="mobile"
                  data-cta="paid-kyvora"
                  data-cta-variant="header"
                  data-testid="gestao-header-cta-mobile"
                  className={cn(gestaoChipClass, "lg:hidden")}
                  onClick={() => trackGestaoCta("mobile")}
                  aria-label={`${brand.gestaoName} (abre em nova aba)`}
                >
                  Gestão
                </a>
              </>
            ) : null}
          </div>

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

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            {selectedTeam ? (
              <Link
                href="/app/selecionar-time"
                data-testid="header-team-switcher"
                className="flex max-w-[9rem] min-w-0 items-center gap-1.5 rounded-md border border-line px-1.5 py-1 text-xs font-medium text-ink-soft hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:max-w-[12rem] sm:px-2 sm:py-1.5"
                title={selectedTeam.name}
                aria-label={`Time atual: ${selectedTeam.name}. Trocar time`}
              >
                <TeamShield
                  logoUrl={selectedTeam.logo_url}
                  name={selectedTeam.name}
                  size="sm"
                />
                <span className="hidden min-w-0 truncate sm:inline">
                  {selectedTeam.name}
                </span>
              </Link>
            ) : null}

            <NotificationsPanel />

            {/* Desktop secondary actions stay inline */}
            <Link
              href="/app/feedback"
              className="hidden min-h-10 min-w-10 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:inline-flex"
              aria-label="Enviar sugestão"
              title="Enviar sugestão"
            >
              <MessageSquarePlus className="h-4 w-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="hidden min-h-10 min-w-10 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:inline-flex"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" aria-hidden />
            </button>

            {/* Mobile account menu: feedback + logout */}
            <div className="relative lg:hidden" ref={accountRef}>
              <button
                type="button"
                data-testid="header-account-menu"
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Mais opções da conta"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((open) => !open)}
              >
                <MoreVertical className="h-4 w-4" aria-hidden />
              </button>
              {accountOpen ? (
                <div
                  role="menu"
                  data-testid="header-account-menu-panel"
                  className="absolute right-0 z-50 mt-1 w-48 overflow-hidden rounded-md border border-line bg-canvas py-1 shadow-lg"
                >
                  <Link
                    role="menuitem"
                    href="/app/feedback"
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink hover:bg-surface"
                    onClick={() => setAccountOpen(false)}
                  >
                    <MessageSquarePlus className="h-4 w-4 text-muted" aria-hidden />
                    Enviar sugestão
                  </Link>
                  <button
                    role="menuitem"
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-ink hover:bg-surface"
                    onClick={() => {
                      setAccountOpen(false);
                      void logout();
                    }}
                  >
                    <LogOut className="h-4 w-4 text-muted" aria-hidden />
                    Sair
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </header>

      <main id="conteudo-principal" className="min-w-0">
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        aria-label="Navegação móvel"
        data-testid="mobile-bottom-nav"
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
