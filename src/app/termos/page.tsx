import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Página reservada para os Termos de Uso do Arena Kyvora.",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="border-b border-line py-16 sm:py-20">
        <Container className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-deep">
            Pendência documental
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Termos de Uso
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Os Termos de Uso oficiais ainda não foram publicados. Esta rota é
            um placeholder estrutural e não constitui contrato ou condições
            vigentes.
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
