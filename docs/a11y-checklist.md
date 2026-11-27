# Roteiro de acessibilidade com leitor de tela

O axe (nos testes E2E) acha problemas **técnicos**: falta de nome, contraste, foco. Ele não diz se a experiência faz sentido para quem ouve a tela. Este roteiro cobre isso e precisa de uma pessoa.

**O que usar (Windows):** NVDA (gratuito, nvaccess.org) com Chrome ou Firefox. Ctrl para parar a fala; Insert+Espaço alterna o modo de navegação.
**Quanto tempo:** uns 30 minutos. Anote o que estranhar; "estranho" já é um achado.

## Como registrar
Para cada passo, marque ✅ (fez sentido), ⚠️ (deu para usar, mas confuso) ou ❌ (não consegui). Em ⚠️ e ❌, escreva o que foi lido e o que você esperava. Abra um *issue* com o título `a11y: <tela> – <resumo>`.

## 1. Biblioteca (`/`)
- [ ] Ao abrir a página, o título "Biblioteca" é lido.
- [ ] Os links do topo (Biblioteca, Importar, Criar com IA) e o botão de tema têm nomes claros.
- [ ] Os exemplos estão fechados; o controle anuncia "recolhido" e, ao abrir, "expandido".
- [ ] Cada cartão de banco diz título, número de questões e situação (em andamento, corrigido).
- [ ] O lembrete de backup (se aparecer) é lido sem precisar procurá-lo.

## 2. Criar com IA (`/criar`)
- [ ] Cada campo é lido com o rótulo e, se obrigatório, "obrigatório".
- [ ] O "?" de Referência curricular e de Número de partes: com Tab chega ao botão e a explicação é lida.
- [ ] "Nível" e "O que você vai enviar" são lidos como grupos de opções, dizendo qual está selecionada.
- [ ] Assuntos: ao adicionar uma tag, é anunciado; cada tag tem "remover".
- [ ] Erro de campo é lido ao tentar copiar o pedido com campo obrigatório vazio.

## 3. Importar (`/importar`)
- [ ] Os passos 1 e 2 são lidos como títulos.
- [ ] Colar um JSON inválido anuncia o erro (sem precisar navegar até ele).
- [ ] Colar um JSON válido anuncia o resumo; a pré-visualização abre com Enter e o gabarito é identificável ("Gabarito" ao lado da alternativa correta).

## 4. Resolver a prova (`/prova`)
- [ ] O progresso é lido ("X de Y respondidas").
- [ ] Cada questão: número, enunciado, alternativas com letra; a escolhida é anunciada.
- [ ] **Fórmulas:** uma questão de Matemática (ex.: Matemática 8º ano, questão da potência) é lida de forma compreensível. Registre exatamente o que o NVDA falou. Se for ruim, ajustamos `speakTex` em `src/core/math.ts`.
- [ ] Discursiva: o campo diz qual questão é e o limite, se houver.

## 5. Corrigir e revisar
- [ ] "Finalizar e corrigir" anuncia que corrigiu e leva ao resultado.
- [ ] Acerto/erro de cada alternativa é dito em palavras, não só por cor.
- [ ] "Revisar N questões": cada clique em Próxima/Anterior fala "Questão X, N de total" e leva o foco para a questão.
- [ ] O destaque colorido não é a única pista: o foco está na questão.

## 6. Dados e backup (`/dados`)
- [ ] Baixar backup avisa que baixou.
- [ ] Restaurar: ao escolher o arquivo, o resumo do que há dentro é lido; as opções Mesclar/Substituir são lidas com a explicação; o modal de confirmação prende o foco e Esc cancela.
- [ ] A barra de armazenamento é lida com a porcentagem.

## 7. Impressão
- [ ] O menu Imprimir abre com Enter, lê as três opções e a desativada ("disponível depois de corrigir"), e fecha com Esc devolvendo o foco ao botão.

## Depois
Mande o que anotou (ou os *issues*). Cada ❌ vira correção na versão seguinte e cada ⚠️ entra no roadmap.
