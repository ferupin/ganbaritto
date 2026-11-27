# Desenvolvimento

## Comandos
`npm run dev` · `npm test` · `npm run typecheck` · `npm run build` (gera `out/`) · `npm run test:watch`

Antes de entregar uma fase rode `typecheck`, `test` e `build`.

## Stack
| Área | Escolha |
|---|---|
| Framework | Next.js (App Router), `output: "export"` |
| Linguagem | TypeScript estrito |
| Estilo | Tailwind CSS v4, tokens como variáveis CSS |
| Estado | Zustand (um store por prova) |
| Validação | Zod em tudo que vem de fora |
| Tema | next-themes, claro por padrão, sem modo automático |
| Ícones | lucide-react |
| Fonte | Fontsource (Atkinson Hyperlegible), local |
| Testes | Vitest, ambiente node |

## Pastas
```
src/
  app/          rotas finas, layout, globals.css (tokens)
  core/         TypeScript puro: schema, score, prompt, validação do formulário
  brand/        nome, logotipo e caminhos gerados (ver docs/design-system.md)
  exams/        catalog/ (10 questões genéricas por matéria, 1º ao 9º ano) e o registro (index.ts). Nunca coloque aqui material de escola, livro ou prova real
  storage/      localStorage com Zod, download de JSON
  i18n/         dicionário pt tipado + t()
  features/     library, runner, importer, creator, changelog
  components/   ui/, theme/, layout/
  changelog/    entries.ts (versões como dado)
  config.ts     marca, versão, links externos
docs/           este material
```

## Regras de camada
- `core/` não importa React, `features/`, `storage/` nem `i18n/`.
- `components/` nunca importa de `features/`.
- `storage/` pode usar `core/`. `features/` pode usar tudo isso.
- URLs externas só em `config.ts`. Texto visível só em `i18n/pt.ts`.
- Testes ao lado do código (`coisa.ts`, `coisa.test.ts`).
- Cores só por token (`bg-paper`, `text-accent`); nada de hex em componente.
- Uma exceção consciente: o pedido enviado à IA e as mensagens de validação do `core/` estão em português dentro do próprio `core/`. Ver ADR 0005.

## Como adicionar…

**Um banco de exemplo:** salve o JSON em `src/exams/catalog/` (o campo `grade` define a etapa), importe e liste em `src/exams/index.ts`. Os testes de `src/exams/exams.test.ts` exigem formato válido, 4 alternativas e sem avisos de qualidade.

**Um componente:** decida a pasta (`components/ui`, ou dentro da feature), use só tokens, dê rótulo acessível, ponha o texto no dicionário, teste em 360 px nos dois temas.

**Um token de cor:** defina nos dois temas em `globals.css`, exponha em `@theme inline` e inclua nos pares de `src/design/contrast.test.ts`.

**Um idioma:** crie `src/i18n/<idioma>.ts` satisfazendo `Messages` e ligue no `t()`. Antes, mova para o dicionário o texto do `core/` (ADR 0005).

**Uma versão (release):**
1. Nova entrada no TOPO de `src/changelog/entries.ts`.
2. Seção correspondente em `docs/CHANGELOG.md`.
3. `version` em `package.json` e `package-lock.json`.
4. Marque o item no `docs/ROADMAP.md`.
5. Commit `chore(release): X.Y.Z` e `git tag -a vX.Y.Z`.
O teste `entries.test.ts` confere versão, ordem, datas e o CHANGELOG.


## Testes de ponta a ponta (E2E)
Ficam em `e2e/` (Playwright + axe) e rodam contra o site **estático** já construído:

```bash
npm run build          # gera out/
npx playwright install chromium   # uma vez só, baixa o navegador de teste
npm run e2e            # sobe o servidor estático na porta 3111 e roda tudo
```

- Já tem Chrome instalado? Use `CHROME_PATH` e pule o `playwright install` (PowerShell: `$env:CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"; npm run e2e`).
- Um arquivo só: `npx playwright test e2e/dados.spec.ts`. Passo a passo no navegador: `npx playwright test --headed`.
- `npm run check` roda tipos e testes unitários. O CI (`.github/workflows/ci.yml`) roda os três mais o build em todo push e pull request.
- O resultado da checagem de acessibilidade (axe) é automático. Para o que só uma pessoa percebe, use `docs/a11y-checklist.md`.
