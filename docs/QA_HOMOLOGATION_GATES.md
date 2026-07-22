# QA Homologation Gates — Arena Kyvora

Padrão obrigatório a partir de 2026-07-22 (incidente: painel de notificações
estourando a viewport no mobile).

> Um cenário **não** está aprovado só porque abriu, retornou HTTP 200,
> não lançou exceção ou passou no Playwright com `toBeVisible()`.

## Gates (todos aplicáveis devem estar verdes)

| Gate | O que valida |
|------|----------------|
| **Funcional** | Regra de negócio correta (criar, ler, persistir, contadores). |
| **Visual** | Legível, alinhado, sem cortes, sem sobreposição indevida. |
| **Responsivo** | Resoluções suportadas; componente cabe na viewport; sem scroll horizontal da página. |
| **Interação** | Mouse, teclado (Escape/Tab) e toque; ações acessíveis. |
| **Técnico** | Console limpo de erros relevantes; rede ok; lint/tsc/unit/build. |
| **Evidência** | Screenshots/vídeos/traces **revisados por humano**, não só gerados. |

## Checklist responsivo — overlays interativos

Aplicar a: modal, dropdown, popover, drawer, tooltip, menu, **notificações**,
seletor, formulário, tabela, card expansível.

Para cada um:

- [ ] Cabe na viewport (`boundingBox` dentro de `0..width`)
- [ ] Não ultrapassa bordas laterais
- [ ] Não cria scroll horizontal na página
- [ ] Botões/ações continuam acessíveis
- [ ] Textos longos quebram (`break-words` / truncamento consciente)
- [ ] Conteúdo longo tem scroll **interno**
- [ ] `z-index` correto (não fica atrás do header/nav)
- [ ] Fecha com fora/Escape/botão
- [ ] Testado em mobile pequeno (`360`, `375`, `390`) **e** desktop

## Resoluções mínimas

| Classe | Viewport |
|--------|----------|
| Mobile pequeno | 360×800 |
| Mobile padrão | 375×667 |
| Mobile grande | 390×844 |
| Tablet | 768×1024 (quando houver breakpoint) |
| Notebook | 1280×720 |
| Desktop | 1440×900 |

## Helpers Playwright

Use `e2e/hml/helpers/viewport.ts`:

- `assertWithinViewport(page, locator)`
- `assertNoPageHorizontalOverflow(page)`

Proibido aprovar overlay só com:

```ts
await expect(panel).toBeVisible();
```

## Evidências

Padronizar sob:

```text
artifacts/playwright/hml/<feature>/{before,after,screenshots,videos,traces,reports}
```

Antes de marcar aprovado: abrir screenshots e assistir vídeos dos casos críticos.

## Incidente de referência — Notificações mobile

- **Sintoma:** painel `Avisos` cortado à esquerda no mobile.
- **Causa:** `absolute right-0` + `w-80` relativo ao sino (à esquerda de feedback/logout).
- **Por que passou:** não havia teste de notificações; mobile só cobria jornadas genéricas; ausência de assertion de bounding box.
- **Regressão:** `e2e/hml/notifications/notifications-responsive.spec.ts`.
