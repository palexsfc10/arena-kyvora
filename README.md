# Arena Kyvora

Repositório próprio do **Arena Kyvora** — frontend público + área autenticada + Arena Admin.

> Não faz parte do monorepo do Kyvora Gestão. A API e o banco continuam **compartilhados** com o Kyvora; este repositório **não** possui banco próprio.

## O que este projeto é hoje

| Superfície | Stack | Papel |
| --- | --- | --- |
| Site público + `/app` | Next.js 15 (App Router) | Landing, auth, explorar, disponibilidades, desafios, meu time |
| Arena Admin (`./admin`) | Vite + nginx | Painel operacional isolado (`hml-adm-arena…`) |
| API | Kyvora backend | `/api/v1/arena/*` e `/api/v1/admin/arena/*` |

Mensagem central: **Encontre times. Marque jogos. Viva o esporte.**

Arena é **gratuito** para times amadores. O Kyvora Gestão permanece o SaaS pago de operação do clube.

## Relação com o Kyvora Gestão

| Produto | Endereço (prod futuro / HML) | Papel |
| --- | --- | --- |
| Kyvora Gestão | `app.` / `hml.` | Operação interna do time |
| Arena Kyvora | `arena.` / `hml-arena.` | Descoberta e desafios entre times |
| Arena Admin | `adm-arena.` / `hml-adm-arena.` | Moderação / operação da plataforma Arena |

Não há duplicação de usuários, contas ou times. Privacidade pública é controlada pelo dirigente no Gestão / flags da API.

## Stack

- Next.js 15 + React 19 + TypeScript strict + Tailwind
- Vitest / Testing Library / Playwright
- Arena Admin: Vite 6 + React 19 + nginx
- Docker multi-stage (Node 22) para imagens HML/deployáveis
- Compose e `.env` reais **permanecem fora do Git** (artefatos operacionais no host)

## Pré-requisitos

- Node.js 22+
- npm 10+
- Docker (para build de imagens)

## Instalação local (site público)

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Arena Admin local

```bash
cd admin
npm ci
cp .env.example .env.local
npm run dev
```

Abra [http://localhost:3020](http://localhost:3020).

## Scripts (site público)

| Script | Descrição |
| --- | --- |
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build |
| `npm run lint` / `typecheck` / `test` / `test:e2e` | Gates |
| `npm run ci` | Pipeline local completo |

## Scripts (Admin)

| Script | Descrição |
| --- | --- |
| `npm run dev` | Vite em `:3020` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc -b` |
| `npm run build` | Bundle estático |
| `npm run validate:env` | Valida `VITE_*` para imagem |

## Contrato de variáveis públicas (bake-time)

`NEXT_PUBLIC_*` e `VITE_*` são **incorporadas no bundle no build**. Não são segredos. Nunca coloque senha, token, chave privada ou credencial nessas variáveis.

| Variável | DEV | HML | PRD (futuro) |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | localhost ok | `https://hml-arena.kyvoraapp.com.br` (obrigatória) | `https://arena.kyvoraapp.com.br` (go-live) |
| `NEXT_PUBLIC_GESTAO_URL` | localhost ok | `https://hml.kyvoraapp.com.br` (**obrigatória**) | `https://app.kyvoraapp.com.br` (go-live) |
| `NEXT_PUBLIC_KYVORA_API_BASE_URL` | localhost ok | `https://hml-api.kyvoraapp.com.br` (obrigatória) | `https://api.kyvoraapp.com.br` (go-live) |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `false` | **`false`** | `true` só no go-live autorizado |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `false` | `false` por padrão | sob decisão + consentimento |
| Admin `VITE_API_BASE_URL` | localhost | `https://hml-api.kyvoraapp.com.br` | API prod no go-live |
| Admin `VITE_APP_ENV` | `development` | `staging` | `production` |

Referências versionadas: `.env.example`, `.env.hml.example`, `admin/.env.example`.
Validador de imagem: `scripts/validate-public-env.mjs` e `admin/scripts/validate-admin-env.mjs`.

- HML: robots `Disallow: /`, metadata `noindex`, sitemap `[]`.
- Admin: sempre `X-Robots-Tag: noindex` (nunca indexável).

## Docker

Compose e `.env` reais ficam **fora** deste repositório. Aqui versionamos apenas Dockerfiles.

O `Dockerfile` **não** define defaults HML/PRD para as URLs públicas. Builds sem
`--build-arg` explícitos falham em `scripts/validate-public-env.mjs`.

### Arena público

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://hml-arena.kyvoraapp.com.br \
  --build-arg NEXT_PUBLIC_KYVORA_API_BASE_URL=https://hml-api.kyvoraapp.com.br \
  --build-arg NEXT_PUBLIC_GESTAO_URL=https://hml.kyvoraapp.com.br \
  --build-arg NEXT_PUBLIC_ALLOW_INDEXING=false \
  --build-arg NEXT_PUBLIC_ENABLE_ANALYTICS=false \
  -t arena-kyvora-web:local .
```

- Runtime: Node 22, usuário `nextjs`, `HOSTNAME=0.0.0.0`, porta `3000`
- Health: `GET /api/health` → `{"status":"ok","service":"arena-web"}`
- Sem bind mount, sem `.env` real na imagem, sem `npm install` no startup

### Arena Admin

```bash
cd admin
docker build \
  --build-arg VITE_API_BASE_URL=https://hml-api.kyvoraapp.com.br \
  --build-arg VITE_APP_ENV=staging \
  -t arena-kyvora-admin:local .
```

- Runtime: nginx estático, porta `80`, SPA fallback, headers de segurança + `noindex`
- Health: `GET /health` → `{"status":"ok","service":"arena-admin"}`

### Rollback

Rollback = **voltar a tag/digest da imagem** (ou o commit da branch) no host de deploy.
**Nunca** apagar banco, volumes Postgres ou dados do Kyvora como parte de rollback do Arena.

## Estrutura

```text
src/                 # Next.js (público + /app)
admin/               # Vite Admin isolado
scripts/             # validate-public-env.mjs
docs/HML.md          # Homologação Jarvis
Dockerfile           # Arena web standalone
admin/Dockerfile     # Admin estático
```

## Documentação adicional

- `docs/HML.md` — homologação
- `docs/ARENA_INTERNAL.md` — área autenticada
- `docs/ARENA_ADMIN.md` — painel admin

## Origem visual

Composição CSS autoral, Lucide (ISC), Syne/Manrope (`next/font`, OFL), favicon SVG autoral. Sem fotos externas nesta base.
