# Arena Admin — Painel administrativo (MVP)

## Diagnóstico e decisão

| Item | Decisão |
|------|---------|
| Frontend | App isolada `arena-kyvora/admin` (Vite), domínio próprio |
| Backend | Mesma API Kyvora: `/api/v1/admin/arena/*` |
| Auth | Login existente `/api/v1/auth/login` + papel em `arena_platform_admins` |
| Role | `arena_platform_admin` (tabela dedicada — não conflita com `platform_members` NTWS) |
| HML | `hml-adm-arena.kyvoraapp.com.br` → `127.0.0.1:3020` |
| Prod | `adm-arena.kyvoraapp.com.br` (não implantado nesta entrega) |
| Analytics | **Sem GA4** no admin |

## Concessão do papel

```bash
cd backend
DATABASE_URL=... python -m scripts.grant_arena_platform_admin --email SEU_EMAIL
DATABASE_URL=... python -m scripts.grant_arena_platform_admin --email SEU_EMAIL --revoke --reason "..."
```

Não hardcodeia e-mail. Identifique o proprietário no ambiente antes de conceder.

## Módulos MVP

Visão geral, Times (bloquear/desbloquear), Usuários (bloqueio Arena), Desafios, Moderação, Avisos, Auditoria, Configurações, export CSV de times.

## Segurança

- Deny by default no backend (`require_admin`)
- Motivo obrigatório em mutações sensíveis
- Auditoria em `audit_logs` (`arena_admin.*`)
- Bloqueio de time remove discoverability e filtra explore
- Bloqueio de usuário é específico do Arena (`arena_user_blocks`), não derruba Gestão
- `noindex,nofollow` no admin
