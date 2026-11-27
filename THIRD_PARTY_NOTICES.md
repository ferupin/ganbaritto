# Avisos de software de terceiros

O Ganbaritto usa os pacotes abaixo em produção (dependências diretas e indiretas). Cada um mantém sua
própria licença e seus direitos autorais. Esta lista é gerada por `npm run licenses` a partir dos
campos `license` de cada `package.json`; **confira os arquivos de licença de cada pacote** antes de
redistribuir fora deste projeto.

Destaques:

- **Atkinson Hyperlegible** (`@fontsource/atkinson-hyperlegible`): SIL Open Font License 1.1, do Braille Institute. A fonte é incluída no site.
- **Plus Jakarta Sans** (`@fontsource/plus-jakarta-sans`): SIL Open Font License 1.1. Incluída no site e usada, convertida em curvas, no logotipo.
- **Noto Sans JP** (Google, SIL Open Font License 1.1): usada só para desenhar 頑張って em curvas no logotipo (`scripts/gerar-logo.py`). Não é instalada nem enviada no site.
- **KaTeX**: MIT. Fontes e CSS são incluídos no site para as fórmulas.
- **lightningcss** (usado pelo Tailwind no build): MPL-2.0. Não vai para o navegador do usuário.
- **caniuse-lite** (dados do build): CC-BY-4.0.

Ferramentas só de desenvolvimento (Playwright, axe-core, Vitest, TypeScript) não fazem parte do site publicado.

| Pacote | Versão | Licença |
|---|---|---|
| @alloc/quick-lru | 5.3.0 | MIT |
| @fontsource/atkinson-hyperlegible | 5.3.0 | OFL-1.1 |
| @fontsource/plus-jakarta-sans | 5.3.0 | OFL-1.1 |
| @jridgewell/gen-mapping | 0.3.13 | MIT |
| @jridgewell/remapping | 2.3.5 | MIT |
| @jridgewell/resolve-uri | 3.1.3 | MIT |
| @jridgewell/sourcemap-codec | 1.6.0 | MIT |
| @jridgewell/trace-mapping | 0.3.31 | MIT |
| @next/env | 16.4.6 | MIT |
| @swc/helpers | 0.5.23 | Apache-2.0 |
| @tailwindcss/node | 4.3.5 | MIT |
| @tailwindcss/oxide | 4.3.5 | MIT |
| @tailwindcss/postcss | 4.3.5 | MIT |
| baseline-browser-mapping | 2.11.39 | Apache-2.0 |
| caniuse-lite | 1.0.30001827 | CC-BY-4.0 |
| client-only | 0.0.1 | MIT |
| commander | 15.1.0 | MIT |
| detect-libc | 2.1.2 | Apache-2.0 |
| enhanced-resolve | 5.27.0 | MIT |
| graceful-fs | 4.2.12 | BlueOak-1.0.0 |
| jiti | 2.7.0 | MIT |
| katex | 0.19.1 | MIT |
| lightningcss | 1.33.0 | MPL-2.0 |
| lucide-react | 1.79.0 | ISC |
| magic-string | 1.4.5 | MIT |
| nanoid | 3.3.20 | MIT |
| next | 16.4.6 | MIT |
| next-themes | 0.4.6 | MIT |
| picocolors | 1.1.1 | ISC |
| postcss | 8.5.33 | MIT |
| react | 19.3.1 | MIT |
| react-dom | 19.3.1 | MIT |
| scheduler | 0.28.0 | MIT |
| source-map-js | 1.2.4 | BSD-3-Clause |
| styled-jsx | 5.1.6 | MIT |
| tailwindcss | 4.3.5 | MIT |
| tapable | 2.3.4 | MIT |
| tslib | 2.9.1 | 0BSD |
| zod | 4.6.7 | MIT |
| zustand | 5.1.0 | MIT |
