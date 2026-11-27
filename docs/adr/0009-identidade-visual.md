# ADR 0009: identidade visual Ganbaritto

Status: aceita (nome ainda provisório)

## Contexto
O projeto ganhou direção de marca: nome de trabalho **Ganbaritto** (de "ganbatte", incentivo, e "gabarito"), paleta Arroz, Nori, Coral, Gergelim e Matcha, e tipografia Plus Jakarta Sans com Atkinson Hyperlegible. O documento de marca é a fonte; este ADR registra o que foi ajustado ao produto real.

## Decisões
- **Paleta mantida, com ajustes por contraste (WCAG AA).** O coral do documento (`#E8754F`) dá 3,89:1 com texto Nori e 2,96:1 com branco. A interface clara usa `#EF8C69` (4,73:1 com Nori); o coral original fica como cor de marca e como botão no tema escuro (5,37:1). Texto e ícone em coral sobre claro usam `#A63D1A`. O verde `#587D68` (4,32:1) virou `#456B55`. Gergelim e Matcha são só preenchimento.
- **Coral é ação e marca, nunca alerta.** O terracota de "pendente" virou âmbar; o erro ficou em vermelho-cereja. Foco do teclado em Nori (claro) e Arroz (escuro).
- **Nomes de token do projeto mantidos** (`desk`, `paper`, `accent`…), em vez dos `brand-*` do documento. Novos: `accent-text`, `ring`, `field`, `hl`, `warm-line`, `brand-coral`.
- **Superfície**: a folha é `#FAF7F1` (a "superfície elevada" do documento), não branco puro; o branco fica para o preenchimento de campos no tema claro.
- **Tipografia**: Plus Jakarta Sans 700/800 em títulos e logotipo; Atkinson no texto. Fontes pelo pacote `@fontsource`, sem CDN.
- **Logotipo**: o nome em curvas, com o último "O" como bolha de gabarito marcada em coral. Assinatura secundária com 頑張って (Noto Sans JP Bold em curvas). Ícone: a bolha marcada sobre Nori. Sem mascote e sem enfeites.
- **Kanji só como arte** (SVG), não como texto no app: a fonte japonesa completa é pesada para um site que funciona offline.
- **Isolamento**: nome em `src/brand/identity.ts`, desenho gerado por script, tokens em `globals.css`. O teste `identity.test.ts` impede o nome escrito à mão fora dali.
- **Não trocar**: prefixo do `localStorage` (`examgen.v1`) e o campo `app` do backup continuam `examgen`, para não apagar dados nem invalidar backups já exportados.

## Fora de escopo agora
Mascote, Kintsugi como elemento visual, conquistas e feedback ilustrado, qualquer promessa de acompanhamento de desempenho ou recursos para professores (o app é sem servidor e sem conta).

## Consequências
- Telas com cores novas: selos "pendente" (âmbar) e erros (cereja) mudam de aparência.
- O nome não foi validado juridicamente (INPI, WIPO, domínios). "Ganbarion" é nome de empresa japonesa de jogos.
- Trocar o nome no futuro é uma edição isolada, mais `npm run licenses`, README e LICENSE.
