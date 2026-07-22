import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { brand, ecosystem } from "@/content/site";
import { env, hasGestaoUrl } from "@/config/env";

export function Ecosystem() {
  return (
    <section
      id={ecosystem.id}
      aria-labelledby="ecosystem-title"
      className="scroll-mt-24 border-b border-line py-16 sm:py-20"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-end">
          <div className="max-w-2xl">
            <h2
              id="ecosystem-title"
              className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
            >
              {ecosystem.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              {ecosystem.subtitleBefore}
              <span className="font-semibold text-kyvora">{brand.gestaoName}</span>
              {ecosystem.subtitleAfter}
            </p>
          </div>

          {hasGestaoUrl() ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:justify-end">
              <Button
                href={env.gestaoUrl}
                variant="kyvora"
                size="lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir {brand.gestaoName}
              </Button>
            </div>
          ) : null}
        </div>

        <ul className="mt-12 grid gap-8 border-t border-line pt-10 md:grid-cols-3">
          {ecosystem.points.map((point) => (
            <li key={point.id}>
              <h3
                className={
                  point.id === "gestao"
                    ? "font-display text-lg font-semibold tracking-tight text-kyvora"
                    : "font-display text-lg font-semibold tracking-tight text-ink"
                }
              >
                {point.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                {point.text}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
