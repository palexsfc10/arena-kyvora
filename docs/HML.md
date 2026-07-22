# Arena Kyvora — homologação (HML) no Jarvis

Ambiente isolado. **Não é produção.**

| Item | Valor |
|------|--------|
| Servidor | Jarvis (Ubuntu + Docker) |
| Clone sugerido | `/home/palex/ntws/arena-kyvora` |
| Branch | `feature/arena-mvp-internal` |
| Hostname público | `https://hml-arena.kyvoraapp.com.br` |
| API HML | `https://hml-api.kyvoraapp.com.br` |
| Gestão HML | `https://hml.kyvoraapp.com.br` |
| Admin HML | `https://hml-adm-arena.kyvoraapp.com.br` |
| Bind local web | `127.0.0.1:3010` → container `:3000` |
| Compose | projeto externo `kyvora-hml` (fora deste Git) |

O frontend **não** deve apontar para IP do Jarvis, hostname interno ou banco.

## Pré-requisitos

1. Stack Kyvora HML (API + Postgres) já preparada no host.
2. Rede Docker compartilhada criada pelo compose Kyvora.
3. Variáveis da API incluem `ARENA_FRONTEND_URL`, CORS e allowlist de redirects.

## Variáveis públicas (somente `NEXT_PUBLIC_*` / `VITE_*`)

Copie `.env.hml.example` / `admin/.env.example` como referência. Valores são **bake-time** no `Dockerfile`.

| Variável | Obrigatoriedade HML | Valor esperado |
|----------|---------------------|----------------|
| `NEXT_PUBLIC_SITE_URL` | obrigatória | `https://hml-arena.kyvoraapp.com.br` |
| `NEXT_PUBLIC_KYVORA_API_BASE_URL` | obrigatória | `https://hml-api.kyvoraapp.com.br` |
| `NEXT_PUBLIC_GESTAO_URL` | **obrigatória** | `https://hml.kyvoraapp.com.br` |
| `NEXT_PUBLIC_ALLOW_INDEXING` | obrigatória (explícita) | **`false`** |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | recomendada `false` | `false` (sem rastreamento acidental) |
| Admin `VITE_API_BASE_URL` | obrigatória | `https://hml-api.kyvoraapp.com.br` |
| Admin `VITE_APP_ENV` | obrigatória | `staging` |

Indexação HML:

- metadata `robots: noindex`
- `robots.txt` com `Disallow: /`
- `sitemap.xml` vazio (`[]`)
- Admin: `X-Robots-Tag: noindex, nofollow` sempre

Auth: access token em `sessionStorage`; refresh via cookie HttpOnly na **API**.

## Build local das imagens

```bash
cd /home/palex/ntws/arena-kyvora
git fetch origin
git checkout feature/arena-mvp-internal
git pull --ff-only origin feature/arena-mvp-internal

docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://hml-arena.kyvoraapp.com.br \
  --build-arg NEXT_PUBLIC_KYVORA_API_BASE_URL=https://hml-api.kyvoraapp.com.br \
  --build-arg NEXT_PUBLIC_GESTAO_URL=https://hml.kyvoraapp.com.br \
  --build-arg NEXT_PUBLIC_ALLOW_INDEXING=false \
  --build-arg NEXT_PUBLIC_ENABLE_ANALYTICS=false \
  -t arena-kyvora-hml:local .

cd admin
docker build \
  --build-arg VITE_API_BASE_URL=https://hml-api.kyvoraapp.com.br \
  --build-arg VITE_APP_ENV=staging \
  -t arena-kyvora-admin-hml:local .
```

### Health

- Web: `GET /api/health` → `{"status":"ok","service":"arena-web"}`
- Admin: `GET /health` → `{"status":"ok","service":"arena-admin"}`

## Integração com compose Kyvora (externo)

No `.env.hml` do backend (fora deste repo):

```text
ARENA_BUILD_CONTEXT=/home/palex/ntws/arena-kyvora
```

Depois: `./deploy.sh` (ou `docker compose ... up -d --build hml-arena`) a partir do diretório operacional Kyvora HML.

## Rollback

1. Identifique a imagem/digest anterior conhecida.
2. Redeploy com essa imagem (ou checkout do commit correspondente + rebuild).
3. **Não** apague banco, volumes ou dados do Kyvora.

## O que não fazer em HML

- Não apontar Arena/Admin HML para `api.kyvoraapp.com.br` ou `app.kyvoraapp.com.br`
- Não setar `NEXT_PUBLIC_ALLOW_INDEXING=true`
- Não versionar `.env` reais
- Não colocar segredos em `NEXT_PUBLIC_*` / `VITE_*`
