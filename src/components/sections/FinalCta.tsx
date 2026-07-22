"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { env, hasGestaoUrl } from "@/config/env";
import { finalCta } from "@/content/site";
import { trackEvent } from "@/lib/analytics";

export function FinalCta() {
  return (
    <section
      id={finalCta.id}
      aria-labelledby="final-cta-title"
      className="scroll-mt-24 border-b border-line bg-ink py-16 text-canvas sm:py-20"
    >
      <Container>
        <div className="max-w-2xl">
          <h2
            id="final-cta-title"
            className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {finalCta.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-canvas/70 sm:text-lg">
            {finalCta.subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              href="/criar-conta"
              size="lg"
              data-analytics={finalCta.primaryEvent}
              onClick={() => trackEvent(finalCta.primaryEvent)}
            >
              {finalCta.primaryLabel}
            </Button>
            {hasGestaoUrl() ? (
              <Button
                href={env.gestaoUrl}
                variant="outline"
                size="lg"
                className="border-white/25 text-canvas hover:border-accent hover:bg-transparent hover:text-accent focus-visible:ring-accent focus-visible:ring-offset-ink"
                target="_blank"
                rel="noopener noreferrer"
                data-analytics={finalCta.secondaryEvent}
                onClick={() => trackEvent(finalCta.secondaryEvent)}
              >
                {finalCta.secondaryLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
