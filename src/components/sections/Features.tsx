import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { features, featuresIntro } from "@/content/site";

export function Features() {
  return (
    <section
      id={featuresIntro.id}
      aria-labelledby="features-title"
      className="scroll-mt-24 border-b border-line py-16 sm:py-20"
    >
      <Container>
        <SectionHeading
          id="features-title"
          title={featuresIntro.title}
          subtitle={featuresIntro.subtitle}
        />

        <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <li key={feature.id} className="group motion-rise-delay-2">
                <div className="mb-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line bg-surface text-ink">
                    <Icon className="h-5 w-5" aria-hidden strokeWidth={1.75} />
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                  {feature.description}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
