# 0002. Tailwind com tokens em variáveis CSS

**Status:** Aceito, versão 0.2.0.

## Contexto
O CSS em um arquivo único (quase mil linhas) misturava layout, cor e estado. A identidade visual ainda vai mudar.

## Decisão
- **Tailwind v4.** Layout, espaçamento e responsividade em utilitários no componente.
- **Cor só por token.** Variáveis CSS nos dois temas, expostas ao Tailwind por `@theme inline`. Trocar o tema muda variáveis, não classes.
- **Classes nomeadas** só para padrões que se repetem (`.btn`, `.badge`, `.card`, `.option`…), via `@apply`, listadas em `docs/design-system.md`.
- **Teste de contraste** lê os valores reais dos tokens.

## Consequências
O teste de contraste já pegou um erro real (`warm` no tema claro a 3,7:1) na primeira execução. Marcado o preço: HTML mais carregado de classes.

## Alternativas consideradas
CSS Modules: bom isolamento, mas não resolve responsividade e tokens por si só. Manter CSS global: dívida crescente.
