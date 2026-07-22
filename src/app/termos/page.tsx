import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/ui/Container";
import { env } from "@/config/env";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Regras de uso do Arena Kyvora.",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="border-b border-line py-16 sm:py-20">
        <Container className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-deep">
            Documento vigente
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Termos de Uso
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Ao criar conta ou usar o Arena Kyvora, você concorda com estes
            termos. Última atualização: julho de 2026.
          </p>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">
            1. O que é o Arena
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            O Arena é uma comunidade gratuita para times amadores se
            apresentarem, publicarem disponibilidade e organizarem desafios. Não
            substitui o Kyvora Gestão nem oferece serviços financeiros.
          </p>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">
            2. Conta e elegibilidade
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Você deve fornecer informações verdadeiras, manter a segurança da
            conta e ser responsável pelas ações realizadas com suas
            credenciais. Contas podem ser suspensas no Arena em caso de abuso,
            fraude ou violação destes termos.
          </p>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">
            3. Conduta
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
            <li>Não publicar conteúdo ofensivo, discriminatório ou ilegal.</li>
            <li>Não assediar outros times ou usuários.</li>
            <li>Não usar o Arena para spam, scraping abusivo ou engenharia social.</li>
            <li>Não tentar contornar bloqueios ou acessar dados de terceiros.</li>
          </ul>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">
            4. Desafios e partidas
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Desafios e confirmações são acordos entre times. O Arena facilita a
            comunicação operacional, mas não garante comparecimento, resultado
            esportivo ou condições do local. Combine detalhes com responsabilidade.
          </p>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">
            5. Conteúdo e propriedade
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Você mantém direitos sobre o conteúdo que envia (ex.: escudo e
            descrição), concedendo à Kyvora licença para exibi-lo no Arena
            conforme as configurações de privacidade do time.
          </p>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">
            6. Limitação
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            O serviço é oferecido “como está”, podendo haver indisponibilidade
            temporária para manutenção ou segurança. Em nenhum caso a Kyvora se
            responsabiliza por danos indiretos decorrentes do uso entre times.
          </p>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">
            7. Contato
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Dúvidas:{" "}
            <a
              href={`mailto:${env.contactEmail}`}
              className="font-semibold text-ink underline-offset-4 hover:underline"
            >
              {env.contactEmail}
            </a>
            .
          </p>

          <Link
            href="/"
            className="mt-10 inline-flex text-sm font-semibold text-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Voltar para a página inicial
          </Link>
        </Container>
      </main>
      <Footer />
    </>
  );
}
