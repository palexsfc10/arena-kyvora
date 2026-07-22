import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { brand, footer, navigation } from "@/content/site";
import { env, hasGestaoUrl } from "@/config/env";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-ink text-canvas">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="font-display text-xl font-semibold tracking-tight">
              {brand.name}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-canvas/70">
              {brand.tagline}
            </p>
            <p className="mt-4 text-sm text-canvas/55">{footer.legalNote}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-canvas/50">
              Navegação
            </p>
            <ul className="mt-4 space-y-2">
              {navigation.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="text-sm text-canvas/80 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              {hasGestaoUrl() ? (
                <li>
                  <a
                    href={env.gestaoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-canvas/80 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {brand.gestaoName}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-canvas/50">
              Legal
            </p>
            <ul className="mt-4 space-y-2">
              {footer.links.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-sm text-canvas/80 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-canvas/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brand.name}
          </p>
          <p>arena.kyvoraapp.com.br</p>
        </div>
      </Container>
    </footer>
  );
}
