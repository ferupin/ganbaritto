# Design system

Identidade: **Ganbaritto** (nome de trabalho, ainda sem validação jurídica). Decisões em `docs/adr/0009-identidade-visual.md`.
Tudo que é identidade (nome, logotipo, cores, fontes) fica isolado para trocar a qualquer momento: veja "Como trocar a identidade" no fim.

## Conceito
Uma **folha de prova sobre uma mesa**. Claro: folha em papel (arroz) sobre mesa arroz. Escuro: folha em azul-marinho (nori) sobre fundo ainda mais profundo, sem preto puro. A identidade não muda entre os temas; só a atmosfera.
Tom de voz: encorajador, claro e direto. "Cada tentativa conta." Sem cobrar perfeição, sem infantilizar. Ganbatte (頑張って) inspira o tom; não obriga a usar japonês na interface.

## Tokens (`src/app/globals.css`)
| Token | Papel |
|---|---|
| `desk`, `paper`, `paper-2`, `field` | mesa, folha, áreas internas, preenchimento de campos |
| `ink`, `muted` | texto principal e secundário (Nori no claro, Arroz no escuro) |
| `line`, `line-strong` | divisor decorativo; borda de campo e alternativa (precisa de 3:1) |
| `accent`, `accent-ink` | **coral de interface**: só preenchimento (botão principal, bolha marcada, sublinhado do menu) e o texto sobre ele |
| `accent-text`, `accent-soft` | coral escuro para texto/ícone sobre a folha; fundo da escolha atual |
| `ring` | anel de foco do teclado (Nori no claro, Arroz no escuro, nunca coral) |
| `hl`, `hl-ink` | gergelim: destaque de revisão, sempre só preenchimento |
| `warm` (+`-soft`, `-line`) | **âmbar**: pendente, atenção, dificuldade média |
| `ok`, `bad` (+`-soft`, `-line`) | acerto/salvo/fácil; erro/inválido/difícil |
| `brand-coral` | coral da marca (logotipo). Não é token de interface |

**Etiquetas (`.badge`)** têm preenchimento, borda e texto da mesma família: `badge` (coral, disciplina e destaques), `badge-ai` (azul: ano, correção automática, informação), `badge-plum` (ameixa: assuntos digitados), `badge-warm` (âmbar: pendente), `badge-ok` (acerto) e `badge-bad` (erro). Tokens: `*-soft` (fundo), `*-line` (borda) e o próprio token como texto.
**Botões:** `btn` usa `btn` e `btn-line` (fundo e borda mais nítidos que `paper-2`).
**Foco de campo (`.input`)**: borda em `accent-text` e halo de 3 px em coral a 30%, sem anel; o outline fica transparente para o modo de alto contraste. Botões e links mantêm o anel `ring`.

## Folha creme no tema escuro
`.sheet-cream` (aplicada à folha da prova) redefine os tokens para a paleta de papel, só no tema escuro (`:root[data-theme="dark"] .sheet-cream` em `globals.css`). Tudo que está dentro herda: questões, alternativas, selos, resultado. Para um elemento dentro da folha voltar ao escuro, use a classe `on-dark` (a barra de revisão usa). O papel noturno é um pouco menos brilhante que o do tema claro (`#F3EAD6` contra `#FAF7F1`). O teste `contrast.test.ts` confere a folha creme à parte. `.card-cream` aplica a mesma paleta a um cartão isolado (os cartões de banco da Biblioteca). Desde a 0.5.6 todo `.sheet` fica creme no escuro (só em `@media screen`, para não afetar a impressão). Regra de ouro: **papel = creme; o que flutua sobre o papel (popovers, barras fixas, toasts, barra de revisão) = escuro via `on-dark`**.

### Botões
- `.btn-primary`: a ação principal da área (uma por área). Coral cheio, base mais escura que afunda ao clicar.
- `.btn`: secundária. Contorno de 2px (`btn-line`), hover com fundo `accent-soft`.
- `.btn-danger`: contorno e texto `bad`, hover `bad-soft`.
- `disabled`: tracejado, fundo `paper-2`, texto `muted`, sem sombra. Não use `opacity` para desabilitar.

## Textura do fundo
`body::before` desenha um grão de papel (ruído SVG embutido, 180 px, fixo) a 16% de opacidade no claro e 11% no escuro (invertido). Só a mesa tem textura; folhas e cartões ficam lisos para o contraste. Desligada em `prefers-contrast: more` e na impressão. Para trocar ou remover, edite esse bloco em `globals.css`.

Regras: coral nunca é texto pequeno nem borda de estado sobre fundo claro; gergelim e Matcha nunca são texto; cor nunca é o único sinal (ícone e palavra acompanham).
`src/design/contrast.test.ts` lê os valores reais dos dois temas e falha se algum par ficar abaixo de AA (4,5:1 para texto, 3:1 para bordas e foco).

## Tipografia
- **Plus Jakarta Sans** 700 e 800 (`font-display`): títulos (h1 a h3 por padrão), título de parte e logotipo.
- **Atkinson Hyperlegible** 400 e 700 (`font-sans`): todo o resto, incluindo enunciados.
Ambas via pacote `@fontsource` (sem CDN, funcionam offline). O kanji 頑張って existe só como arte da assinatura (SVG em curvas); não há fonte japonesa carregada no app.

## Marca (`src/brand/`)
- `identity.ts`: nome, slug de arquivo, frase, prefixo de armazenamento.
- `Logo.tsx`: `Wordmark` (SVG) e `Logo` (link do topo). Letras em `currentColor`, bolha em `--brand-coral`.
- `logo-paths.ts`: **gerado** por `scripts/gerar-logo.py` (também escreve `public/brand/*.svg` e `src/app/icon.svg`).
- Versões: nome (claro/escuro), assinatura com 頑張って (claro/escuro) e ícone (bolha marcada sobre Nori).
- Ícones derivados (`src/app/favicon.ico`, `apple-icon.png`, `public/brand/icone-192.png` e `-512.png`): `scripts/gerar-icones.py`, a partir de `src/app/icon.svg`.
Detalhe do logotipo: o último "O" é uma bolha de gabarito marcada. Sem mascote, sem enfeite ao lado do nome.

## Padrões que se repetem (classes em `globals.css`)
`.sheet` folha · `.btn` (+ `-primary`, `-danger`, `-sm`, `-icon`) · `.badge` (+ `-warm`, `-ok`, `-bad`, `-muted`) · `.callout` (+ `-warn`, `-bad`) · `.input` · `.card` · `.pick` (botão de escolha: segmentado e rubrica) · `.option` (alternativa) · `.question` · `.part-title`. Layout e espaçamento ficam em utilitários dentro dos componentes.

## Cor nunca é o único sinal
Correto/errado têm texto e ícone. Campo inválido tem borda vermelha **e** mensagem **e** `aria-invalid`. Tipo de correção é um selo com texto.

## Controles
| Intenção | Controle |
|---|---|
| Fazer algo | Botão |
| Ligar/desligar | Interruptor (`role="switch"`), caso do tema |
| Uma entre poucas | Segmentado (rádio nativo; uma parada de Tab, setas dentro) |
| Confirmar ação destrutiva ou com perda | Modal nativo `<dialog>` |
| Resultado de uma ação | Toast no topo (sobrepõe, nunca empurra o layout, entra e sai com fade). O tipo `saved` é o aviso discreto de "salvo no navegador" |
| Explicar um termo | Ícone "?" (`HelpTip`): abre com mouse, foco ou toque; Esc fecha |
| Lista de itens curtos | Etiquetas removíveis (`TagInput`): Enter, vírgula ou botão adicionam |
| Nível/dificuldade | `Segmented` com `tone` (verde, âmbar, vermelho) e sempre com texto; os não selecionados ficam neutros e só a escolha tem cor cheia (a cor aparece de leve ao passar o mouse) |
| Copiar | Botão com ícone que vira "ok" por 2 s |
| Link que sai do app | Ícone de seta, `target="_blank"`, `noopener`, texto "(abre em outra aba)" para leitor de tela |

## Fórmulas
`RichText` (`src/components/math/`) é a única porta para texto de questão com fórmula. Sem `$` no texto não custa nada; com `$`, baixa o KaTeX uma vez. Fontes do KaTeX vêm do pacote (`katex/dist/fonts`), nunca de CDN.

## Dados, pré-visualização e impressão
- `/dados`: três cartões (backup, restaurar, armazenamento). O resumo do arquivo escolhido aparece **antes** de qualquer mudança; "Substituir tudo" usa o botão `btn-danger` e o modal de confirmação.
- `ExamPreview` (Importar): números, gabarito por letra e questões somente leitura com a alternativa correta em verde e o texto "Gabarito" (nunca só a cor).
- `PrintMenu`: botão com `aria-haspopup="menu"`; fecha com Esc ou clique fora; "Prova corrigida" fica desabilitada até corrigir. `PrintView` só existe no papel.

## Revisão e topo
`ReviewNav` (barra fixa embaixo, só com a prova corrigida) destaca a questão com `data-flash`; com movimento reduzido o destaque é estático. `ScrollTopButton` fica fixo à direita e a revisão deixa 5rem livres para ele.

## Campos
Campo preenchido tem fundo mais claro e uma barra de destaque à esquerda (`.input:not(:placeholder-shown)`), por isso todo campo precisa de `placeholder`.
Obrigatório tem `*` e `aria-required`. Erro aparece depois que a pessoa sai do campo, ou em todos ao tentar copiar. Números aceitam só dígitos e uma faixa (`src/core/creator-validation.ts`). Placeholders são exemplos neutros, nunca dados de pessoas.

## Layout e movimento
Funciona a partir de 360 px sem rolagem horizontal. Transições curtas (até ~250 ms) e desligadas com `prefers-reduced-motion`.

## Acessibilidade
Contraste AA testado nos dois temas; foco visível; teclado em tudo; axe automatizado nos testes de navegador; ícones decorativos com `aria-hidden`; botões só com ícone têm rótulo.

## Voz
Encorajadora, direta, em português. Sem gírias. Exemplos: "Cada tentativa conta.", "Vamos dar mais um passo?".

## Como trocar a identidade
1. **Nome**: `src/brand/identity.ts`. O teste `identity.test.ts` falha se o nome estiver escrito à mão em outro lugar. Não mude `storagePrefix` nem o `app` do backup (`src/storage/backup.ts`): mudar apaga o acesso a dados salvos e invalida backups.
2. **Logotipo**: edite `scripts/gerar-logo.py` (fontes, tamanhos) e rode; ou substitua `Logo.tsx`, `logo-paths.ts` e `public/brand/*`, `src/app/icon.svg` à mão.
3. **Cores**: os dois blocos de tokens no topo de `globals.css` e `themeColor` em `layout.tsx`. Rode `npx vitest run src/design`.
4. **Fontes**: os imports em `src/app/layout.tsx` e `--font-display`/`--font-sans` em `globals.css`.
5. **Documentos**: `LICENSE`, `README.md`, `THIRD_PARTY_NOTICES.md` (`npm run licenses`).
