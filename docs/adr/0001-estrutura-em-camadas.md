# 0001. Estrutura em camadas

**Status:** Aceito, versão 0.2.0.

## Contexto
O MVP nasceu com tudo em `lib/` e `components/`. O padrão do projeto-irmão pede núcleo puro, camadas com direção única e testes ao lado do código.

## Decisão
- **`core/` puro.** Schema, pontuação, pedido para a IA e validação do formulário, sem React nem armazenamento.
- **Direção das dependências:** `core` ← `storage`/`exams` ← `features` ← `app`. `components/` nunca importa `features/`.
- **Registro de bancos** em `exams/index.ts`: um banco novo é um arquivo de dados mais uma linha.
- **Store por prova** (Zustand vanilla). Trocar de prova não apaga o trabalho da outra, e cada questão lê só a própria resposta.
- **Zod em tudo que vem de fora**: arquivo importado, biblioteca, tentativa, histórico, campos do formulário.

## Consequências
Mais arquivos, mas cada um pequeno e testável sozinho. Mover código passa a ser mecânico.

## Alternativas consideradas
Manter `lib/` plano: simples, mas o limite entre lógica e interface se perde. Redux: peso desnecessário.
