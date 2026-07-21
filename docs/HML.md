# Arena Kyvora — homologação (HML) no Jarvis

Ambiente isolado. **Não é produção.**

| Item | Valor |
|------|--------|
| Servidor | Jarvis (Ubuntu + Docker) |
| Clone sugerido | `/home/palex/ntws/arena-kyvora` |
| Branch | `feature/arena-mvp-internal` |
| Hostname público | `https://hml-arena.kyvoraapp.com.br` |
| API HML | `https://hml-api.kyvoraapp.com.br` |
| Bind local | `127.0.0.1:3010` → container `:3000` |
| Compose | projeto `kyvora-hml` (serviço `hml-arena` em `C:\kyvora\deploy\hml`) |

O frontend **não** deve apontar para IP do Jarvis, hostname interno ou banco.

## Pré-requisitos

1. Stack Kyvora HML (API + Postgres `kyvora_hml`) já preparada em `/home/palex/ntws/kyvora-hml/deploy/hml`.
2. Rede Docker `kyvora_hml_net` criada pelo compose Kyvora.
3. Variáveis da API incluem `ARENA_FRONTEND_URL`, CORS e allowlist de redirects (ver `kyvora/deploy/hml/.env.hml.example`).

## Variáveis públicas (somente `NEXT_PUBLIC_*`)

Copie `.env.hml.example` como referência. Valores são **bake-time** no `Dockerfile`.

| Variável | Uso |
|----------|-----|
| `NEXT_PUBLIC_SITE_URL` | URL canônica do Arena HML |
| `NEXT_PUBLIC_KYVORA_API_BASE_URL` | Base da API HML |
| `NEXT_PUBLIC_GESTAO_URL` | Link opcional ao Gestão HML |
| Demais | marketing / contato — sem secrets |

Auth: access token em `sessionStorage`; refresh via cookie HttpOnly na **API** (`SameSite=None; Secure` em HML HTTPS).

## Build local da imagem

```bash
cd /home/palex/ntws/arena-kyvora
git fetch origin
git checkout feature/arena-mvp-internal
git pull --ff-only origin feature/arena-mvp-internal

docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://hml-arena.kyvoraapp.com.br \
  --build-arg NEXT_PUBLIC_KYVORA_API_BASE_URL=https://hml-api.kyvoraapp.com.br \
  --build-arg NEXT_PUBLIC_GESTAO_URL=https://hml.kyvoraapp.com.br \
  -t arena-kyvora-hml:local .
```

Health: `GET /api/health` → `{"status":"ok"}`.

## Integração com compose Kyvora

No `.env.hml` do backend:

```text
ARENA_BUILD_CONTEXT=/home/palex/ntws/arena-kyvora
```

Depois: `./deploy.sh` (ou `docker compose ... up -d --build hml-arena`) a partir de `kyvora/deploy/hml`.

Documentação completa do stack: `kyvora/deploy/hml/README.md`.
