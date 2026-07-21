"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { env } from "@/config/env";
import { hero } from "@/content/site";
import { trackEvent } from "@/lib/analytics";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b border-line"
    >
      <div className="pointer-events-none absolute inset-0 hero-field" aria-hidden />
      <div className="pointer-events-none absolute inset-0 hero-grain" aria-hidden />

      <Container className="relative grid min-h-[min(92vh,760px)] items-end gap-10 pb-14 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-20 lg:pt-20">
        <div className="max-w-xl motion-rise">
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-accent motion-pulse" aria-hidden />
            {hero.eyebrow}
          </p>

          <p className="font-display text-sm font-semibold tracking-[0.08em] text-ink/70 sm:text-base">
            Arena Kyvora
          </p>

          <h1
            id="hero-title"
            className="mt-3 font-display text-[2.35rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-[3.35rem]"
          >
            {hero.title}
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            {hero.subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              href={hero.primaryCta.href}
              size="lg"
              data-analytics={hero.primaryCta.event}
              onClick={() => trackEvent(hero.primaryCta.event)}
            >
              {hero.primaryCta.label}
            </Button>
            <Button
              href={env.gestaoUrl}
              variant="outline"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
              data-analytics={hero.secondaryCta.event}
              onClick={() => trackEvent(hero.secondaryCta.event)}
            >
              {hero.secondaryCta.label}
            </Button>
          </div>
        </div>

        <aside
          className="relative rounded-lg border border-line bg-canvas/80 p-5 shadow-none backdrop-blur-[2px] motion-rise-delay sm:p-6"
          aria-label={hero.previewLabel}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              {hero.previewLabel}
            </p>
            <span className="text-[11px] font-medium text-muted">Não operacional</span>
          </div>

          <div className="space-y-3" aria-hidden>
            <div className="rounded-md border border-dashed border-line bg-surface px-4 py-3">
              <p className="text-xs text-muted">Cidade ou região</p>
              <p className="mt-1 text-sm font-medium text-ink/45">Ex.: São Paulo</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-dashed border-line bg-surface px-4 py-3">
                <p className="text-xs text-muted">Modalidade</p>
                <p className="mt-1 text-sm font-medium text-ink/45">Futsal</p>
              </div>
              <div className="rounded-md border border-dashed border-line bg-surface px-4 py-3">
                <p className="text-xs text-muted">Raio</p>
                <p className="mt-1 text-sm font-medium text-ink/45">Até 20 km</p>
              </div>
            </div>
            <div className="rounded-md bg-ink px-4 py-3 text-center text-sm font-semibold text-canvas/70">
              Buscar times
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            {hero.previewCaption}
          </p>
        </aside>
      </Container>
    </section>
  );
}
