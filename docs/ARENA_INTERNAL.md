# Arena Kyvora — Frontend MVP notes

Ver documentação completa em `C:\kyvora\docs\arena\ARENA_MVP.md`.

## Área interna

- `/entrar` — login com identidade Kyvora
- `/app/explorar` — home autenticada
- `/app/disponibilidades` — publicar/cancelar
- `/app/desafios` — enviados/recebidos + ações
- `/app/meu-time` — preferências públicas (opt-in)
- `/app/selecionar-time` — troca de time
- `/app/sem-time` — orienta a criar time no Arena
- `/app/criar-time`, `/app/ativar-participacao` — onboarding nativo

## Auth

Access token em `sessionStorage`. Refresh via cookie Kyvora (`credentials: include`).
Pendência prod: BFF ou SameSite=None para cross-subdomain `arena` → `api`.
