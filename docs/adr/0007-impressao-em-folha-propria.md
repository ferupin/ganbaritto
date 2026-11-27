# ADR 0007: Impressão com folha própria em vez de imprimir a tela

**Status:** aceita (0.5.0)

## Contexto
Imprimir a tela interativa (o que existia) traz a interface (barras, botões, caixas de correção) e, depois de corrigir, mostra acertos e erros. Para uma prova de papel isso não serve: o aluno não pode ver o gabarito, e o responsável quer uma folha de respostas separada.

## Decisão
1. Três saídas no menu Imprimir: **Caderno de prova** (sem gabarito nem explicações, cabeçalho com nome/data/turma, bolinhas nas alternativas e linhas para as discursivas, em número proporcional à pontuação), **Gabarito** (tabela de letras, resposta e explicação por questão, critérios das discursivas) e **Prova corrigida** (a tela como está, só depois de corrigir).
2. Caderno e gabarito são **componentes próprios** (`PrintView`), renderizados só quando escolhidos e visíveis só no papel (`hidden print:block`); a tela interativa recebe `print:hidden` nesse momento. Assim o conteúdo do papel não depende do estado da tela, e não há como o gabarito vazar para o caderno.
3. Tamanho A4 e margem de 14 mm por `@page`; fundo branco e tinta preta por tokens de impressão; cada questão com `break-inside: avoid`.
4. Estrutura de bloco (não flex) nas questões impressas: o Chrome não respeita "não quebrar" em itens flex, e as linhas da discursiva ficavam separadas da pergunta.
5. Linhas de escrita são elementos (`.print-line`), não gradiente: o gradiente repetido saiu truncado no PDF.

## Verificação
Os testes E2E trocam o modo, emulam mídia de impressão e geram PDF (`page.pdf`) para conferir: folha certa visível, tela escondida, conteúdo permitido por modo, fundo branco, PDF válido e entre 1 e 3 páginas. Os defeitos acima foram achados olhando PDFs reais renderizados. **Ainda não foi testado em papel nem em outros navegadores.**

## Consequências
- Ctrl+P direto (sem o menu) continua imprimindo a tela, como antes.
- Nova saída de impressão = novo modo em `PrintView` + teste no `e2e/imprimir.spec.ts`.
