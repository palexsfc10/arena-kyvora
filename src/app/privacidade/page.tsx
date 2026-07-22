import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/ui/Container";
import { env } from "@/config/env";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o Arena Kyvora trata dados pessoais.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="border-b border-line py-16 sm:py-20">
        <Container className="max-w-3xl prose-arena">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-deep">
            Documento vigente
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Política de Privacidade
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Esta política descreve como o Arena Kyvora, produto do ecossistema
            Kyvora, trata dados pessoais no uso da plataforma. Última
            atualização: julho de 2026.
          </p>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">
            1. Quem é responsável
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            O tratamento é realizado pela Kyvora no contexto do Arena. Contato:{" "}
            <a
              href={`mailto:${env.contactEmail}`}
              className="font-semibold text-ink underline-offset-4 hover:underline"
            >
              {env.contactEmail}
            </a>
            .
          </p>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">
            2. Quais dados coletamos
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
            <li>Dados de conta: nome, e-mail e senha (armazenada de forma segura).</li>
            <li>
              Dados do time: nome, modalidade, cidade/UF, descrição pública e
              escudo, quando fornecidos.
            </li>
            <li>
              Dados de uso do Arena: disponibilidades, desafios, mensagens
              operacionais da partida e registros técnicos necessários à
              segurança.
            </li>
            <li>
              Dados de analytics (somente com consentimento): eventos agregados
              de navegação e interação, sem enviar e-mail, nome, telefone ou
              conteúdo de mensagens.
            </li>
          </ul>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">
            3. Para que usamos
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Prestação do serviço (cadastro, autenticação, descoberta de times,
            desafios), segurança, prevenção a abuso, suporte e, quando
            autorizado, melhoria do produto via métricas agregadas.
          </p>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">
            4. Compartilhamento
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Dados do time e conteúdos que você tornar públicos no Arena podem
            ser vistos por outros usuários autenticados. Não vendemos dados
            pessoais. Prestadores essenciais (hospedagem, e-mail, analytics)
            podem processar dados sob instruções e medidas de segurança
            adequadas.
          </p>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">
            5. Seus direitos
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Nos termos da LGPD, você pode solicitar acesso, correção, exclusão,
            portabilidade e informações sobre o tratamento. Use o e-mail de
            contato acima.
          </p>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">
            6. Relação com o Kyvora Gestão
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Arena e Gestão compartilham autenticação e entidade de time quando
            aplicável. Dados financeiros e operacionais internos da Gestão não
            são exibidos no Arena público.
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
