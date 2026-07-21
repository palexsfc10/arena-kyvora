import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Página reservada para a Política de Privacidade do Arena Kyvora.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="border-b border-line py-16 sm:py-20">
        <Container className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-deep">
            Pendência documental
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Política de Privacidade
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            O conteúdo legal desta página ainda não foi publicado. Esta rota
            existe para preparar a estrutura do site e não contém texto
            jurídico definitivo.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Quando o Arena Kyvora entrar em operação com dados pessoais, a
            política oficial será publicada aqui, alinhada ao ecossistema
            Kyvora.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex text-sm font-semibold text-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Voltar para a página inicial
          </Link>
        </Container>
      </main>
      <Footer />
    </>
  );
}
