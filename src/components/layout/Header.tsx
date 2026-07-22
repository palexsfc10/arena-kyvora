"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { brand, navigation } from "@/content/site";
import { env, hasGestaoUrl } from "@/config/env";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter]",
        scrolled
          ? "border-line/80 bg-canvas/90 backdrop-blur-md"
          : "border-transparent bg-canvas/70 backdrop-blur-sm",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          aria-label={`${brand.name} — início`}
        >
          {brand.name}
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {item.label}
            </a>
          ))}
          {hasGestaoUrl() ? (
            <a
              href={env.gestaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              onClick={() => trackEvent("nav_gestao")}
            >
              {brand.gestaoName}
            </a>
          ) : null}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            href="/entrar"
            variant="outline"
            size="md"
            data-analytics="cta_header_entrar"
            onClick={() => trackEvent("cta_header_entrar")}
          >
            Entrar
          </Button>
          <Button
            href="/criar-conta"
            size="md"
            data-analytics="cta_header_criar_conta"
            onClick={() => trackEvent("cta_header_criar_conta")}
          >
            Criar conta grátis
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-ink md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
      </Container>

      <div
        id={menuId}
        className={cn(
          "border-t border-line bg-canvas md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <Container className="flex flex-col gap-1 py-4" as="nav" aria-label="Mobile">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="rounded-md px-3 py-3 text-base font-medium text-ink hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={close}
            >
              {item.label}
            </a>
          ))}
          {hasGestaoUrl() ? (
            <a
              href={env.gestaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-3 py-3 text-base font-medium text-ink hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => {
                trackEvent("nav_gestao_mobile");
                close();
              }}
            >
              {brand.gestaoName}
            </a>
          ) : null}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              href="/entrar"
              variant="outline"
              className="w-full"
              onClick={() => {
                trackEvent("cta_header_entrar_mobile");
                close();
              }}
            >
              Entrar
            </Button>
            <Button
              href="/criar-conta"
              className="w-full"
              onClick={() => {
                trackEvent("cta_header_criar_conta_mobile");
                close();
              }}
            >
              Criar conta grátis
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}
