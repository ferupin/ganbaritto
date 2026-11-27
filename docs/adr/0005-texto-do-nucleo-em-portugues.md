# 0005. Texto do núcleo em português (por enquanto)

**Status:** Aceito, versão 0.2.0. A revisar quando houver segundo idioma.

## Contexto
O padrão pede que `core/` não tenha texto visível e receba as palavras por uma função de tradução. Aqui há dois textos em `core/`: as mensagens de validação do JSON e o **pedido enviado à IA**. O pedido é conteúdo do produto, escrito em português para um aluno brasileiro.

## Decisão
Só português por enquanto. Os dois textos ficam no `core/`. Todo o resto da interface já usa o dicionário.

## Consequências
Antes de adicionar um idioma será preciso injetar uma função `Translate` no `core/` (validação) e decidir se o pedido à IA muda de idioma junto com a interface ou com o aluno.
