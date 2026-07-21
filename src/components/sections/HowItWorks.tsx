import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { howItWorks } from "@/content/site";

export function HowItWorks() {
  return (
    <section
      id={howItWorks.id}
      aria-labelledby="how-title"
      className="scroll-mt-24 border-b border-line bg-surface/60 py-16 sm:py-20"
    >
      <Container>
        <SectionHeading
          id="how-title"
          title={howItWorks.title}
          subtitle={howItWorks.subtitle}
        />

        <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {howItWorks.steps.map((step, index) => (
            <li key={step.id} className="relative">
              {index < howItWorks.steps.length - 1 ? (
                <span
                  className="pointer-events-none absolute left-[3.25rem] top-5 hidden h-px w-[calc(100%-1.5rem)] bg-line md:block"
                  aria-hidden
                />
              ) : null}
              <p className="font-display text-sm font-semibold tracking-[0.16em] text-accent-deep">
                {step.number}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted sm:text-base">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
