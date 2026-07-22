"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
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
              href={hero.secondaryCta.href}
              variant="outline"
              size="lg"
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
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            {hero.previewLabel}
          </p>

          <ul className="space-y-3">
            {hero.previewItems.map((item) => (
              <li
                key={item.label}
                className="rounded-md border border-line bg-surface px-4 py-3"
              >
                <p className="text-sm font-semibold text-ink">{item.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </aside>
      </Container>
    </section>
  );
}
