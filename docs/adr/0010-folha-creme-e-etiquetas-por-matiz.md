# ADR 0010: folha creme no tema escuro e etiquetas por matiz

Status: aceita

## Contexto
No tema escuro a folha da prova ficava azul-marinho, cansativa para leitura longa à noite. Etiquetas, botões secundários e avisos tinham fundos de baixa saturação que se misturavam ao cartão, e o foco dos campos usava o mesmo anel grosso dos botões.

## Decisões
- **Folha creme no escuro**: a folha da prova (e tudo dentro) usa tokens de papel (`.sheet-cream`), com tom `#F3EAD6`, um pouco mais quente e menos brilhante que o papel do tema claro. O que fica fora (mesa, cabeçalho, barra de revisão, botão de topo, avisos) é escuro, para a folha ser o foco. Implementado como redefinição de tokens, sem trocar classes dos componentes, e com `on-dark` para exceções.
- **Escopo**: a prova (`sheet-cream`) e os cartões de banco (`card-cream`). A mesa e as demais páginas seguem escuras. Estender é adicionar a classe.
- **Textura**: grão de papel sutil só na mesa (fundo geral), em SVG embutido; desligada em alto contraste e na impressão.
- **Paleta ampliada**: além de coral, gergelim e matcha do documento de marca, entram **azul (ai)** e **ameixa (plum)**, complementares ao coral, usados só em etiquetas e ornamento. Cada papel tem uma matiz fixa (ver `docs/design-system.md`); cor nunca é o único sinal, porque todo selo traz texto.
- **Presença sem exagero**: fundos de etiqueta mais saturados e borda na mesma família; texto sempre ≥ 4,5:1 sobre o fundo da própria etiqueta e sobre a folha (testado nos três ambientes: claro, escuro e creme).
- **Foco de campo suave**: borda coral escuro e halo translúcido. Mantém indicador visível (borda a 4,5:1 ou mais sobre a folha) e `outline` transparente para o modo de alto contraste.
- **Histórico em cartões**: `<details>` nativo (sem JavaScript), só o mais recente aberto, resumo e contagem por tipo visíveis fechados.

## Consequências
- O vermelho de erro no escuro ficou um pouco mais claro (`#F8B8B0`) para passar no botão de perigo.
- A folha creme no escuro tem seus próprios pares no teste de contraste.
- O tema "creme" não existe no sistema de impressão, que continua com seu próprio conjunto.
