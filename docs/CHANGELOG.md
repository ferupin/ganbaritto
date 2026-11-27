# Histórico de versões

Também aparece no app, em `/versoes`. A fonte dos dados é `src/changelog/entries.ts`; um teste confere que as duas listas batem.
Versões seguem o padrão X.Y.Z: função nova aumenta o Y, correção aumenta o Z, quebra de compatibilidade aumenta o X.

## 0.5.6 (2026-11-27)

Todas as folhas em creme no tema escuro, janelinhas e barras flutuantes escuras e botões com hierarquia clara.

**Mudanças**
- No tema escuro, todas as folhas (Criar, Importar, Dados, Versões e a prova) ficam em creme. O que flutua por cima, como a barra de ações do Criar e as janelinhas de ajuda, fica escuro, em contraste com o papel.
- Botões com função clara: o principal é coral cheio com uma base que afunda ao clicar; os demais têm contorno firme e ficam coral-claro ao passar o mouse; o de perigo tem contorno vermelho.
- Botão desabilitado agora parece desabilitado de verdade (borda tracejada, fundo apagado), sem ficar ilegível.

**Por dentro**
- Cores do creme valem para qualquer .sheet só em tela (@media screen), sem afetar a impressão. Novo teste de navegador para as folhas e a hierarquia dos botões.

## 0.5.5 (2026-11-27)

Cartões dos bancos em creme no tema escuro, textura sutil no fundo e botões com contraste próprio.

**Mudanças**
- No tema escuro, os cartões dos bancos (Meus bancos e Exemplos) também ficam em creme, como a folha da prova. A mesa continua escura.
- O fundo geral ganhou uma textura de grão de papel muito fina, só na mesa. As folhas e os cartões continuam lisos. Ela some no modo de alto contraste e na impressão.
- O botão principal ganhou uma base mais marcada, para parecer clicável em qualquer fundo.

**Por dentro**
- Classe `card-cream` (mesma paleta da folha creme) e testes de navegador para a textura e para os cartões.

## 0.5.4 (2026-11-27)

Leitura noturna mais confortável, etiquetas e botões mais vivos, foco suave nos campos e histórico em cartões.

**Mudanças**
- No tema escuro, a folha da prova e tudo dentro dela (questões, alternativas, resultado) ficam em tom creme, mais agradável para ler à noite. O entorno, o cabeçalho e a barra de revisão continuam escuros.
- Etiquetas com cor definida e borda: coral para disciplina, azul para ano e correção automática, ameixa para os assuntos que você digita, âmbar para pendente, verde para acerto e cereja para erro. Ficaram mais presentes, sem estourar o contraste.
- Botões com fundo e borda mais nítidos nos dois temas, e avisos (notas) com fundo colorido em vez de cinza.
- O foco dos campos agora é uma borda coral com um halo suave, no lugar do anel grosso.
- O histórico de versões agora é uma lista de cartões: só o mais recente começa aberto, e cada cartão mostra o resumo e a quantidade de mudanças antes de abrir.
- Os assuntos adicionados aparecem com um pequeno movimento, para você ver o que acabou de entrar.

**Por dentro**
- Novos tokens de cor (`accent-line`, `ai`, `plum`, `btn`, `btn-line` e suas variações) e uma escala creme para a folha no tema escuro (classe `sheet-cream`), tudo coberto pelo teste de contraste.
- Testes de navegador novos para a folha creme, o foco e os cartões do histórico.

## 0.5.3 (2026-11-26)

Identidade visual Ganbaritto: nome, logotipo, cores e fontes novos nos dois temas.

**Mudanças**
- O app agora se chama Ganbaritto (nome de trabalho, ainda provisório), com logotipo novo: o último O do nome é uma bolha de gabarito marcada.
- Cores novas nos dois temas (papel arroz e azul-marinho nori, com coral nas ações) e títulos em Plus Jakarta Sans. O texto das questões continua em Atkinson Hyperlegible.
- O selo de correção pendente passou de terracota para âmbar, e os erros ficaram em vermelho-cereja, para o coral da marca nunca parecer um alerta.
- O destaque da revisão agora usa o amarelo de marca-texto (gergelim), com o mesmo fade suave.
- O arquivo de backup baixado agora se chama `ganbaritto-backup-AAAA-MM-DD.json`. Backups antigos (`examgen-backup-...`) continuam sendo aceitos.

**Por dentro**
- Pasta `src/brand` com nome, logotipo e caminhos gerados por `scripts/gerar-logo.py`; um teste impede o nome escrito à mão fora dela.
- Ícone da aba refeito (a bolha marcada): `favicon.ico`, ícone SVG e ícone para iPhone, gerados por `scripts/gerar-icones.py`. Arquivos do logotipo em `public/brand`.
- O projeto passa a viver em github.com/ferupin/ganbaritto; links, `package.json` e README atualizados.
- Teste de contraste ampliado: foco, bordas de campo, destaque e todos os pares de texto nos dois temas.
- ADR 0009 registra os ajustes de contraste feitos sobre o documento de marca.

## 0.5.2 (2026-11-26)

Projeto preparado para código aberto e teste de impressão mais confiável.

**Mudanças**
- A Biblioteca agora traz só os bancos de exemplo genéricos (um por matéria, do 1º ao 9º ano). As revisões da escola foram removidas do app para que o projeto possa ser aberto sem material de terceiros.

**Correções**
- O teste de impressão agora garante que a folha de papel está na tela antes de gerar o PDF e guarda o PDF em `test-results` para conferência.

**Por dentro**
- Licenças (MIT para o código, CC BY 4.0 para os bancos de exemplo), código de conduta, política de segurança, modelos de issue e de Pull Request, Dependabot e avisos de terceiros.
- Guia para iniciantes sobre testes de ponta a ponta e integração contínua (`docs/guia-testes-e2e-e-ci.md`).

## 0.5.1 (2026-11-26)

**Correções**
- `npm run build` falhava com "Cannot find module '@playwright/test'" quando as dependências ainda não estavam instaladas. Os testes de ponta a ponta saíram da checagem de tipos do build e ganharam a própria (`npm run typecheck:e2e`).

## 0.5.0 (2026-11-25)

Backup e restauração, pré-visualização do gabarito antes de salvar, impressão em caderno e gabarito, e testes de ponta a ponta no repositório.

**Novidades**
- Página **Dados e backup** (rodapé): baixar e restaurar um arquivo com bancos, tentativas, histórico e o formulário do criador. Restaurar pode **mesclar** (nunca sobrescreve um banco diferente) ou **substituir tudo** (com confirmação). Se o armazenamento encher no meio, nada é alterado.
- Lembrete discreto de backup na Biblioteca (mais de 30 dias ou nunca feito; "Depois" adia 7 dias).
- Uso do armazenamento e pedido de armazenamento persistente.
- **Importar** mostra, antes de salvar, números do banco, gabarito por letra e as questões com a alternativa correta e a explicação.
- **Imprimir** com três saídas: Caderno de prova, Gabarito e Prova corrigida.

**Mudanças**
- No papel: fundo branco, tinta preta e questões inteiras na mesma página.

**Por dentro**
- E2E (Playwright + axe) no repositório (`npm run e2e`), gerando PDF na impressão; CI no GitHub; ADR 0006 e 0007; `docs/a11y-checklist.md`.

## 0.4.1 (2026-11-25)

Destaque das questões a rever mais suave, com fade-out.

**Mudanças**
- O destaque é um brilho azul suave que entra rápido e se dissolve devagar, em vez de um contorno que some de repente.
- Com "reduzir movimento" ativado no sistema, o destaque fica parado e discreto.

## 0.4.0 (2026-11-25)

Fórmulas matemáticas e químicas, navegação pelas questões a rever, botão de voltar ao topo e criador com "Sem material".

**Novidades**
- Fórmulas nas questões: `$x^2 + 3x = 10$`, em bloco `$$\frac{a}{b}$$`, química `$\ce{H2O}$`. Fontes e estilos vêm no próprio app, sem internet.
- Depois de corrigir, "Revisar questões" leva às erradas, em branco ou com nota baixa, em ordem, com destaque temporário.
- Botão de voltar ao topo quando o cabeçalho e o menu saem de vista.
- Criar com IA: opção "Sem material" (a IA busca referências no nível da série e dos assuntos); pedido e textos de apoio se adaptam a imagens, texto ou nenhum material.
- Importar: "Colar da área de transferência", "Limpar" e contador de caracteres.
- Ajuda no campo "Número de partes".

**Mudanças**
- Nível: opções não selecionadas ficam apagadas; só a escolhida tem a cor cheia.
- Exemplos sempre fechados na tela inicial.
- Importar com dois passos e divisor "ou".
- "Salvo no navegador" em faixa própria no topo.
- Matemática do catálogo usa fórmulas.

**Correções**
- Barra invertida de fórmula sem dobrar no JSON (`\frac` virava caractere de controle) agora é recusada com explicação.

**Por dentro**
- KaTeX carregado sob demanda; "R$ 5,00" nunca vira fórmula; fórmulas com `aria-label` em português; testes novos.

## 0.3.0 (2026-11-24)

Biblioteca focada nos seus bancos, catálogo de exemplos do 1º ao 9º ano e formulário mais claro.

**Novidades**
- Catálogo de exemplos: 10 questões por matéria (Língua Portuguesa, Matemática, Ciências, História, Geografia, Língua Inglesa, Arte, Educação Física, Ensino Religioso), do 1º ao 9º ano.
- "Assuntos" vira lista de etiquetas removíveis.
- Ícone "?" em Referência curricular.
- Aviso discreto "Salvo no navegador" no topo.

**Mudanças**
- Tela inicial mostra os seus bancos; exemplos ficam num painel sob demanda.
- "Versões" saiu da navegação e foi para o rodapé.
- Avisos no topo, com fade.
- Campos preenchidos se distinguem dos vazios; nível com botões coloridos.
- O simulado de História do protótipo foi substituído pelo catálogo; as revisões da escola ficam em grupo à parte.

**Por dentro**
- Etapa derivada de `grade`; testes do catálogo; componentes HelpTip, TagInput e Segmented com tom.

## 0.2.0 (2026-11-24)

Criar com IA por formulário, tema claro por padrão e nova base visual.

**Novidades**
- Criar com IA: campos para aluno, escola e simulado; o pedido é montado enquanto você digita e fica salvo no navegador.
- Pedido pronto para qualquer IA entender que você só enviará imagens (ou texto) e deve receber um único JSON.
- Validação dos campos com asterisco de obrigatório, destaque em vermelho e mensagem clara.
- Atalhos para Gemini, ChatGPT e Claude no fim da tela de criação.
- Botão para copiar um pedido de correção quando a importação encontra erros.
- Avisos na importação para gabarito concentrado em uma letra e correta sempre a mais longa.
- Confirmações em modal acessível e avisos rápidos (toasts).
- Página de versões e mudanças.

**Mudanças**
- Tema claro (creme) por padrão; a troca é só entre claro e escuro, sem seguir o sistema.
- Interface reescrita com Tailwind CSS, ícones consistentes e layout fluido.
- Fonte Atkinson Hyperlegible carregada junto com o app.
- Cor `warm` do tema claro escurecida para passar no contraste AA (descoberto pelo teste de contraste).

**Por dentro**
- Código reorganizado em `core`, `storage`, `exams`, `features`, `components`, `i18n`, `changelog`.
- Store Zustand por prova; tentativas e histórico lidos do navegador passam por Zod.
- Dicionário tipado, testes ao lado do código, exportação estática ligada.

## 0.1.0 (2026-11-23)

Primeira versão: importar, resolver e corrigir simulados a partir de um JSON.

- Importar e exportar bancos em JSON (formato versão 1) com validação em português.
- Prova com progresso, salvamento automático e retomada.
- Correção automática das objetivas e assistida das discursivas.
- Histórico das últimas 30 tentativas.
- Tema claro e escuro, impressão básica.
- Três bancos de exemplo de História do 5º ano.
