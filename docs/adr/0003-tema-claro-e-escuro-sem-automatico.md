# 0003. Tema claro por padrão, só claro e escuro

**Status:** Aceito, versão 0.2.0.

## Contexto
A prova deve parecer uma folha de papel. Seguir o tema do sistema fazia a tela mudar sozinha e surpreendia quem usa o app para estudar.

## Decisão
`next-themes` com `defaultTheme="light"` e `enableSystem={false}`. Dois temas, interruptor no cabeçalho, escolha guardada em `examgen.v1.theme`. O app ignora o tema do sistema.

## Consequências
Previsível. Quem quer escuro liga uma vez. Se algum dia for desejado, o modo automático é uma linha.

## Alternativas consideradas
Três estados (automático, claro, escuro): mais controle, porém mais confuso para o público.
