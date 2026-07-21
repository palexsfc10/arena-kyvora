# Arena Kyvora

Landing page pública do **Arena Kyvora** — experiência futura para aproximar times amadores, encontrar adversários e viabilizar novos jogos.

> Repositório próprio. Não faz parte do monorepo/repositório principal do Kyvora Gestão.

## Visão do produto

O Arena Kyvora será um ambiente público para:

- Encontrar times e oportunidades de partidas
- Localizar equipes por cidade, região e modalidade
- Enviar e responder desafios
- Combinar amistosos
- Publicar disponibilidade
- Exibir perfil público do time (com privacidade controlada pelo dirigente)

Nesta entrega, o produto inclui a **landing page pública** e a **primeira área interna funcional** (`/app`), integrada ao backend central do Kyvora (`/api/v1/arena`).

Mensagem central: **Encontre times. Marque jogos. Viva o esporte.**

Documentação completa do MVP: ver também `C:\kyvora\docs\arena\ARENA_MVP.md` (backend) e o workspace multi-root `arena-kyvora.code-workspace`.

## Relação com o Kyvora Gestão

| Produto | Endereço | Papel |
| --- | --- | --- |
| Kyvora Gestão | `app.kyvoraapp.com.br` | SaaS pago de operação do time |
| Arena Kyvora | `arena.kyvoraapp.com.br` (futuro) | Experiência pública para encontrar jogos |

Futuramente, Arena e Gestão compartilharão backend, autenticação e entidade de time. **Não haverá duplicação** de usuários, contas, times ou jogadores. O dirigente controlará o que fica público.

## Decisões arquiteturais

- Frontend isolado em repositório próprio (este)
- Next.js App Router + TypeScript strict + Tailwind
- Conteúdo centralizado em `src/content` para edição sem caçar JSX
- Config pública via `NEXT_PUBLIC_*` (`src/config/env.ts`)
- Contratos futuros de API apenas documentados (`src/config/future-api.ts`)
- Sem backend local, sem auth e sem busca fingindo funcionar
- Visual autoral em CSS (sem fotos externas nesta versão)
- Analytics só com consentimento + IDs reais + flag explícita

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS 3
- Lucide Icons
- Vitest + Testing Library
- Playwright
- ESLint (`eslint-config-next`)

## Pré-requisitos

- Node.js 20+ (recomendado 22)
- npm 10+

## Instalação local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts disponíveis

| Script | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes E2E (Playwright) |
| `npm run ci` | Pipeline local completo |

## Variáveis de ambiente

Veja `.env.example`.

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL canônica / metadata |
| `NEXT_PUBLIC_SITE_NAME` | Nome do site |
| `NEXT_PUBLIC_GESTAO_URL` | Link para Kyvora Gestão |
| `NEXT_PUBLIC_WAITLIST_URL` | URL externa de captura de interesse (opcional) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Fallback de contato / waitlist |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `true` para permitir scripts após consentimento |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics (opcional) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel (opcional) |

Nenhum segredo de backend deve ser colocado no frontend.

## Testes

```bash
npm run test
npx playwright install chromium   # primeira vez
npm run build
npm run test:e2e
```

## Build

```bash
npm run build
npm run start
```

## Deploy na Vercel

1. Importe este repositório na Vercel
2. Framework preset: **Next.js**
3. Configure as variáveis `NEXT_PUBLIC_*` (mínimo: `NEXT_PUBLIC_SITE_URL=https://arena.kyvoraapp.com.br`)
4. Domínio futuro sugerido: `arena.kyvoraapp.com.br`
5. Deploy

Não é necessário banco, serverless functions nem integrações nesta etapa.

## Estrutura de diretórios

```text
src/
  app/                 # Rotas App Router (landing + placeholders legais)
  components/
    analytics/         # Consentimento e carregamento condicional
    layout/            # Header / Footer
    sections/          # Seções da landing
    ui/                # Primitivos reutilizáveis
  config/              # env + contratos futuros de API
  content/             # Copy e estrutura de conteúdo
  i18n/                # Preparação para localização
  lib/                 # Utilitários (cn, analytics events)
  test/                # Setup Vitest
e2e/                   # Playwright
public/                # Favicon e estáticos versionados
.github/workflows/     # CI
```

## Funcionalidades atuais

- Landing page pública responsiva
- Navegação por âncoras + menu mobile acessível
- Seção de funcionalidades planejadas com selo “Em breve”
- Como funcionará (3 passos)
- Relação com Kyvora Gestão
- CTA de acompanhamento (link configurável ou mailto)
- SEO (metadata, OG, Twitter, robots, sitemap, JSON-LD)
- Placeholders honestos de Privacidade e Termos
- Página de Contato via e-mail
- Preparação de analytics com consentimento

## Funcionalidades planejadas (produto)

Todas **em breve** — não operacionais nesta release:

1. Encontre jogos
2. Times próximos
3. Desafie outros times
4. Organize amistosos
5. Disponibilidade do time
6. Perfil público
7. Integração com dados do Kyvora Gestão

## Evolução arquitetural

Quando o Arena sair da landing:

1. **APIs públicas do Kyvora** — busca de times, perfil público, disponibilidade e desafios (`src/config/future-api.ts`)
2. **Identidade única** — mesmo usuário/time do Kyvora Gestão; sem cadastro paralelo
3. **Privacidade** — dirigente controla campos públicos; nunca expor endereço privado
4. **Auth cross-domain** — estratégia segura entre `app.` e `arena.` (cookies/OAuth/session bridge)
5. **Desafios → Gestão** — confrontos confirmados podem gerar registros na operação
6. **Proteção** — rate limiting, abuse prevention e consentimento para geolocalização
7. **Observabilidade** — métricas de funil (busca → desafio → confirmação)

Esta etapa **não** implementa banco, auth nem backend paralelo.

## Pendências reais (decisão externa)

- Conteúdo jurídico definitivo (Privacidade / Termos)
- URL definitiva de captura de leads (`NEXT_PUBLIC_WAITLIST_URL`)
- IDs reais de GA / Meta Pixel (se forem usados)
- Domínio e DNS de `arena.kyvoraapp.com.br`
- Design system compartilhado futuro com o ecossistema Kyvora
- Contratos finais das APIs públicas

## Origem e licença de recursos visuais

- **Sem fotografias** nesta versão
- Composição gráfica autoral em CSS (`hero-field` / `hero-grain` em `globals.css`)
- Ícones: [Lucide](https://lucide.dev/) (ISC)
- Tipografia: Syne e Manrope via `next/font` (SIL Open Font License)
- Favicon SVG autoral em `public/favicon.svg`

## Referência de protótipo

Houve um protótipo conceitual em `https://arena-kyvora.palexsfc.chatgpt.site`. A implementação deste repositório foi reconstruída profissionalmente a partir do briefing do produto; a URL de referência pode exigir autenticação e não é dependência de runtime.
