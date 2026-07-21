"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  CalendarPlus,
  Compass,
  ExternalLink,
  LogOut,
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
    trackEvent("paid_kyvora_cta_clicked", {
      placement:
        viewport === "desktop"
          ? "authenticated_sidebar"
          : "authenticated_mobile_nav",
      viewport,
      origin: "arena",
    });
  } catch {
    // Analytics must never block navigation.
  }
}

function GestaoCtaLink({
  href,
  viewport,
  variant,
}: {
  href: string;
  viewport: "desktop" | "mobile";
  variant: "full" | "compact";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cta-viewport={viewport}
      data-cta="paid-kyvora"
      data-cta-variant={variant}
      className={cn(
        "kyvora-paid-cta block w-full rounded-md border transition-colors",
        variant === "full" ? "px-3 py-3 text-left" : "px-3 py-2.5 text-left",
      )}
      onClick={() => trackGestaoCta(viewport)}
      aria-label={`${brand.gestaoName} — teste grátis por 7 dias. Conhecer o Kyvora (abre em nova aba)`}
    >
      {variant === "full" ? (
        <span className="flex flex-col gap-1.5">
          <span className="kyvora-paid-cta-support text-[11px] font-normal leading-snug">
            Precisa organizar seu time?
          </span>
          <span className="whitespace-nowrap text-sm font-semibold leading-tight">
            {brand.gestaoName}
          </span>
          <span className="kyvora-paid-cta-seal inline-flex w-fit rounded px-1.5 py-0.5 text-[11px] font-semibold leading-none tracking-wide">
            Teste grátis por 7 dias
          </span>
          <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold">
            Conhecer o Kyvora
            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
          </span>
        </span>
      ) : (
        <span className="flex items-center justify-between gap-2">
          <span className="min-w-0">
            <span className="block whitespace-nowrap text-sm font-semibold leading-tight">
              {brand.gestaoName}
            </span>
            <span className="kyvora-paid-cta-seal mt-1 inline-flex rounded px-1.5 py-0.5 text-[11px] font-semibold leading-none tracking-wide">
              7 dias grátis
            </span>
          </span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
        </span>
      )}
    </a>
  );
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
    <div className="min-h-dvh bg-canvas lg:flex">
      <aside
        className="sticky top-0 z-30 hidden h-dvh w-56 shrink-0 flex-col border-r border-line/80 bg-canvas xl:w-64 lg:flex"
        aria-label="Navegação principal"
      >
        <div className="shrink-0 border-b border-line/60 px-4 py-4">
          <Link
            href="/app/explorar"
            className="font-display text-base font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={`${brand.shortName} by ${brand.ecosystem} — início`}
          >
            <span>{brand.shortName}</span>
            <span className="ml-1.5 text-[11px] font-medium tracking-wide text-muted">
              by {brand.ecosystem}
            </span>
          </Link>
        </div>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 py-3" aria-label="Área interna">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  active ? "bg-surface text-ink" : "text-muted hover:text-ink",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 truncate">{item.label}</span>
                {item.href === "/app/desafios" && pendingReceived > 0 ? (
                  <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-ink">
                    {pendingReceived}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {gestaoHref ? (
          <div className="shrink-0 border-t border-line/60 p-3">
            <p className="mb-2 px-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
              Produto complementar
            </p>
            <GestaoCtaLink href={gestaoHref} viewport="desktop" variant="full" />
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-[calc(8.75rem+env(safe-area-inset-bottom))] lg:pb-0">
        <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/95 backdrop-blur-md">
          <Container className="flex h-14 items-center justify-between gap-2 sm:gap-3 lg:max-w-none">
            <Link
              href="/app/explorar"
              className="shrink-0 font-display text-base font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
              aria-label={`${brand.shortName} by ${brand.ecosystem} — início`}
            >
              <span>{brand.shortName}</span>
              <span className="ml-1.5 text-[11px] font-medium tracking-wide text-muted">
                by {brand.ecosystem}
              </span>
            </Link>

            <div className="hidden min-w-0 flex-1 lg:block" aria-hidden />

            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              {selectedTeam ? (
                <Link
                  href="/app/selecionar-time"
                  className="flex min-w-0 items-center gap-1.5 rounded-md border border-line px-2 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  title={selectedTeam.name}
                >
                  <TeamShield
                    logoUrl={selectedTeam.logo_url}
                    name={selectedTeam.name}
                    size="sm"
                  />
                  <span className="max-w-[6rem] truncate sm:max-w-[10rem] md:max-w-[12rem]">
                    {selectedTeam.name}
                  </span>
                </Link>
              ) : null}

              <NotificationsPanel />

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

        <main id="conteudo-principal" className="flex-1">
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        aria-label="Navegação móvel"
      >
        {gestaoHref ? (
          <div className="border-b border-line/60 px-3 py-2">
            <GestaoCtaLink href={gestaoHref} viewport="mobile" variant="compact" />
          </div>
        ) : null}
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
