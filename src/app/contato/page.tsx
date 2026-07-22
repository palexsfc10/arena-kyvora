import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { env, hasGestaoUrl } from "@/config/env";
import { brand } from "@/content/site";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a equipe do Arena Kyvora.",
};

export default function ContactPage() {
  const mailto = `mailto:${env.contactEmail}?subject=${encodeURIComponent("Contato Arena Kyvora")}`;

  return (
    <>
      <Header />
      <main className="border-b border-line py-16 sm:py-20">
        <Container className="max-w-3xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Contato
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Para dúvidas sobre o lançamento do Arena Kyvora ou sobre o
            ecossistema Kyvora, use o e-mail abaixo. Não há formulário de
            envio nesta etapa.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={mailto} size="lg">
              Escrever para {env.contactEmail}
            </Button>
            <Button href="/" variant="outline" size="lg">
              Voltar ao início
            </Button>
          </div>
          {hasGestaoUrl() ? (
            <p className="mt-6 text-sm text-muted">
              Também é possível acessar o{" "}
              <Link
                href={env.gestaoUrl}
                className="font-semibold text-kyvora underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {brand.gestaoName}
              </Link>
              .
            </p>
          ) : null}
        </Container>
      </main>
      <Footer />
    </>
  );
}
