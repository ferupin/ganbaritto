# Roadmap

Atualizado a cada versão. Cada item tem **custo** (esforço e risco de manter), **necessidade** (o que acontece sem ele) e **importância** (peso para o conceito do projeto: simulados escolares, sem servidor, bancos gerados por qualquer IA, dados só no navegador). Escala: baixo / médio / alto.

O detalhamento técnico de cada item (arquivos, formato, testes, riscos, dependências) está em [plano-de-implementacao.md](plano-de-implementacao.md).

## Como priorizamos
1. Primeiro o que protege o dado e a confiança no resultado (backup, gabarito certo, impressão).
2. Depois o que fecha o ciclo de aprender (refazer erros, evolução por assunto).
3. Só então o que amplia conteúdo (imagens, gráficos) e distribuição (PWA, compartilhar).
4. Nada entra se exigir servidor, conta ou envio de dados do aluno. Se um dia exigir, vira decisão registrada em ADR.

## Feito
- [x] 0.1.0 Importar, resolver e corrigir simulados (JSON v1)
- [x] 0.2.0 Criar com IA por formulário, tema claro/escuro, Tailwind, estrutura em camadas, versões
- [x] 0.3.0 Catálogo de exemplos do 1º ao 9º ano, biblioteca com exemplos sob demanda, formulário refinado
- [x] 0.5.0 Backup e restauração, pré-visualização, impressão em três saídas, E2E e CI no repositório
- [x] 0.4.1 Destaque de revisão mais suave, com fade-out
- [x] 0.4.0 Fórmulas (KaTeX), navegador de questões a rever, botão de topo, criador com "Sem material", importar reformulado

## Fase 1 (0.5.0): Confiança e segurança dos dados (entregue, falta a revisão com leitor de tela)
| Item | Custo | Necessidade | Importância |
|---|---|---|---|
| Backup e restauração de tudo (biblioteca + tentativas + criador) em um arquivo. Hoje limpar o navegador apaga tudo. | baixo | alta | alta |
| Impressão revisada: caderno de prova e gabarito separados, fórmulas incluídas, verificada em papel (nunca testada de fato). | médio | alta | alta |
| Pré-visualização no Importar: ver as questões, o gabarito e os avisos antes de salvar. IA erra gabarito e o app hoje só valida formato. | médio | alta | alta |
| E2E dentro do repositório e CI no GitHub (tsc, testes, build) a cada push. Os scripts E2E hoje não estão no repositório. | baixo | alta | média |
| Teste real com leitor de tela (NVDA/VoiceOver) nas telas principais e em fórmulas. Hoje só axe automático. | baixo | média | alta |

## Fase 2 (0.6.0): Ciclo de aprender (próxima)
| Item | Custo | Necessidade | Importância |
|---|---|---|---|
| "Refazer só as que errei": nova tentativa com as questões de `reviewTargets`. Reaproveita o que existe. | baixo | média | alta |
| Modo estudo: resposta e explicação logo após cada questão (hoje só ao corrigir tudo). | médio | média | alta |
| Campo opcional `topic` por questão e relatório por assunto/parte ao longo das tentativas (já guardamos 30). | médio | média | alta |
| Cronômetro opcional e embaralhar alternativas por tentativa (sem mudar ids). | baixo | baixa | média |
| Editar gabarito e texto de uma questão no app, para corrigir o erro da IA sem voltar ao JSON. | alto | média | alta |

## Fase 3 (0.7.0): Conteúdo além do texto
| Item | Custo | Necessidade | Importância |
|---|---|---|---|
| Imagens nas questões (mapas, gráficos, figuras) guardadas no navegador, com texto alternativo obrigatório. A criação por foto do livro pede isso. | alto | alta para Geografia, Matemática, Ciências | alta |
| Gráficos e figuras simples em SVG, sanitizados. Risco de segurança: exige lista de elementos permitidos. | alto | média | média |
| Mais de um ano por matéria no catálogo e Ensino Médio. Conteúdo escrito por mim precisa de revisão humana. | médio (conteúdo) | média | média |
| Mais matérias de formação técnica/idiomas conforme pedidos reais. | médio | baixa | baixa |

## Fase 4 (0.8.0): Distribuição
| Item | Custo | Necessidade | Importância |
|---|---|---|---|
| PWA instalável com uso offline. | médio | média | média |
| Compartilhar um banco por link ou QR (JSON comprimido no endereço), sem servidor. Limite de tamanho. | médio | média | média |
| Identidade: nome definitivo, domínio e verificação de marca (INPI, WIPO). A identidade visual de trabalho (Ganbaritto) já está aplicada (0.5.3, ADR 0009). Bloqueia divulgação. | baixo (decisão) | alta antes de divulgar | alta |
| Troca do identificador interno `examgen` que sobrou (prefixo do `localStorage` e campo `app` do backup, que deve continuar aceitando o nome antigo na leitura). O repositório e o `package.json` já se chamam ganbaritto. Em versão própria, só se o nome for validado (ADR 0008). | baixo | alta antes de divulgar | média |
| Segundo idioma (exige mover texto do `core/` para o dicionário, ADR 0005). | alto | baixa | baixa |

## Ideias avaliadas e adiadas
- **Contas e sincronização na nuvem:** quebra o princípio "dados só no navegador". Só com ADR.
- **Banco público de simulados da comunidade:** exige moderação e fonte confiável de gabarito.
- **Nota oficial/BNCC automática:** o app só oferece escala 0–3 de apoio; não vira nota da escola.

## Limites conhecidos hoje
- Fórmulas: tudo que estiver entre `$ ... $` é renderizado. Símbolos matemáticos soltos fora dos cifrões usam a fonte do sistema.
- Impressão, PWA e deploy na Vercel ainda não foram verificados em condições reais.
- O catálogo é conteúdo ilustrativo escrito por IA; confira antes de usar com o aluno.
