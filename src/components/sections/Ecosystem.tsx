import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { brand, ecosystem } from "@/content/site";
import { env } from "@/config/env";

export function Ecosystem() {
  return (
    <section
      id={ecosystem.id}
      aria-labelledby="ecosystem-title"
      className="scroll-mt-24 border-b border-line py-16 sm:py-20"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-end">
          <SectionHeading
            id="ecosystem-title"
            title={ecosystem.title}
            subtitle={ecosystem.subtitle}
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:justify-end">
            <Button
              href={env.gestaoUrl}
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir {brand.gestaoName}
            </Button>
          </div>
        </div>

        <ul className="mt-12 grid gap-8 border-t border-line pt-10 md:grid-cols-3">
          {ecosystem.points.map((point) => (
            <li key={point.id}>
              <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
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
