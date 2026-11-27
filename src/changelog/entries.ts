/**
 * Histórico de versões como dado tipado. A tela /versoes e o teste de
 * consistência leem daqui, e cada versão também tem uma seção em
 * docs/CHANGELOG.md. Versão nova = uma entrada no TOPO desta lista.
 *
 * Os textos ficam em português (único idioma por enquanto). Ao adicionar
 * outro idioma, troque `string` por um registro por idioma e o teste de
 * completude passa a exigir todos.
 */
export type ChangeKind = "added" | "changed" | "fixed" | "data" | "internal";

export interface ChangelogEntry {
  /** Semântica X.Y.Z: função nova = Y, correção = Z, quebra = X. */
  version: string;
  /** AAAA-MM-DD. */
  date: string;
  /** Uma frase com o que a versão entrega. */
  summary: string;
  changes: Partial<Record<ChangeKind, string[]>>;
}

export const kindOrder: ChangeKind[] = ["added", "changed", "fixed", "data", "internal"];

export const entries: ChangelogEntry[] = [
  {
    version: "0.5.6",
    date: "2026-11-27",
    summary: "Todas as folhas em creme no tema escuro, janelinhas e barras flutuantes escuras e botões com hierarquia clara.",
    changes: {
      changed: [
        "No tema escuro, todas as folhas (Criar, Importar, Dados, Versões e a prova) ficam em creme. O que flutua por cima, como a barra de ações do Criar e as janelinhas de ajuda, fica escuro, em contraste com o papel.",
        "Botões com função clara: o principal é coral cheio com uma base que afunda ao clicar; os demais têm contorno firme e ficam coral-claro ao passar o mouse; o de perigo tem contorno vermelho.",
        "Botão desabilitado agora parece desabilitado de verdade (borda tracejada, fundo apagado), sem ficar ilegível.",
      ],
      internal: [
        "Cores do creme valem para qualquer .sheet só em tela (@media screen), sem afetar a impressão. Novo teste de navegador para as folhas e a hierarquia dos botões.",
      ],
    },
  },
  {
    version: "0.5.5",
    date: "2026-11-27",
    summary: "Cartões dos bancos em creme no tema escuro, textura sutil no fundo e botões com contraste próprio.",
    changes: {
      changed: [
        "No tema escuro, os cartões dos bancos (Meus bancos e Exemplos) também ficam em creme, como a folha da prova. A mesa continua escura.",
        "O fundo geral ganhou uma textura de grão de papel muito fina, só na mesa. As folhas e os cartões continuam lisos. Ela some no modo de alto contraste e na impressão.",
        "O botão principal ganhou uma base mais marcada, para parecer clicável em qualquer fundo.",
      ],
      internal: [
        "Classe card-cream (mesma paleta da folha creme) e testes de navegador para a textura e para os cartões.",
      ],
    },
  },
  {
    version: "0.5.4",
    date: "2026-11-27",
    summary: "Leitura noturna mais confortável, etiquetas e botões mais vivos, foco suave nos campos e histórico em cartões.",
    changes: {
      changed: [
        "No tema escuro, a folha da prova e tudo dentro dela (questões, alternativas, resultado) ficam em tom creme, mais agradável para ler à noite. O entorno, o cabeçalho e a barra de revisão continuam escuros.",
        "Etiquetas com cor definida e borda: coral para disciplina, azul para ano e correção automática, ameixa para os assuntos que você digita, âmbar para pendente, verde para acerto e cereja para erro. Ficaram mais presentes, sem estourar o contraste.",
        "Botões com fundo e borda mais nítidos nos dois temas, e avisos (notas) com fundo colorido em vez de cinza.",
        "O foco dos campos agora é uma borda coral com um halo suave, no lugar do anel grosso.",
        "O histórico de versões agora é uma lista de cartões: só o mais recente começa aberto, e cada cartão mostra o resumo e a quantidade de mudanças antes de abrir.",
        "Os assuntos adicionados aparecem com um pequeno movimento, para você ver o que acabou de entrar.",
      ],
      internal: [
        "Novos tokens de cor (accent-line, ai, plum, btn, btn-line e suas variações) e uma escala creme para a folha no tema escuro (classe sheet-cream), tudo coberto pelo teste de contraste.",
        "Testes de navegador novos para a folha creme, o foco e os cartões do histórico.",
      ],
    },
  },
  {
    version: "0.5.3",
    date: "2026-11-26",
    summary: "Identidade visual Ganbaritto: nome, logotipo, cores e fontes novos nos dois temas.",
    changes: {
      changed: [
        "O app agora se chama Ganbaritto (nome de trabalho, ainda provisório), com logotipo novo: o último O do nome é uma bolha de gabarito marcada.",
        "Cores novas nos dois temas (papel arroz e azul-marinho nori, com coral nas ações) e títulos em Plus Jakarta Sans. O texto das questões continua em Atkinson Hyperlegible.",
        "O selo de correção pendente passou de terracota para âmbar, e os erros ficaram em vermelho-cereja, para o coral da marca nunca parecer um alerta.",
        "O destaque da revisão agora usa o amarelo de marca-texto (gergelim), com o mesmo fade suave.",
        "O arquivo de backup baixado agora se chama ganbaritto-backup-AAAA-MM-DD.json. Backups antigos (examgen-backup-...) continuam sendo aceitos.",
      ],
      internal: [
        "Pasta src/brand com nome, logotipo e caminhos gerados por scripts/gerar-logo.py; um teste impede o nome escrito à mão fora dela.",
        "Ícone da aba refeito (a bolha marcada): favicon.ico, ícone SVG e ícone para iPhone, gerados por scripts/gerar-icones.py. Arquivos do logotipo em public/brand.",
        "O projeto passa a viver em github.com/ferupin/ganbaritto; links, package.json e README atualizados.",
        "Teste de contraste ampliado: foco, bordas de campo, destaque e todos os pares de texto nos dois temas.",
        "ADR 0009 registra os ajustes de contraste feitos sobre o documento de marca.",
      ],
    },
  },
  {
    version: "0.5.2",
    date: "2026-11-26",
    summary: "Projeto preparado para código aberto e teste de impressão mais confiável.",
    changes: {
      changed: [
        "A Biblioteca agora traz só os bancos de exemplo genéricos (um por matéria, do 1º ao 9º ano). As revisões da escola foram removidas do app para que o projeto possa ser aberto sem material de terceiros.",
      ],
      fixed: [
        "O teste de impressão agora garante que a folha de papel está na tela antes de gerar o PDF e guarda o PDF em test-results para conferência.",
      ],
      internal: [
        "Licenças (MIT para o código, CC BY 4.0 para os bancos de exemplo), código de conduta, política de segurança, modelos de issue e de Pull Request, Dependabot e avisos de terceiros.",
        "Guia para iniciantes sobre testes de ponta a ponta e integração contínua (docs/guia-testes-e2e-e-ci.md).",
      ],
    },
  },
  {
    version: "0.5.1",
    date: "2026-11-26",
    summary: "O build do site não depende mais das ferramentas de teste.",
    changes: {
      fixed: [
        "`npm run build` falhava com \"Cannot find module '@playwright/test'\" quando as dependências ainda não estavam instaladas. Os testes de ponta a ponta saíram da checagem de tipos do build e ganharam a própria (`npm run typecheck:e2e`).",
      ],
    },
  },
  {
    version: "0.5.0",
    date: "2026-11-25",
    summary: "Backup e restauração, pré-visualização do gabarito antes de salvar, impressão em caderno e gabarito, e testes de ponta a ponta no repositório.",
    changes: {
      added: [
        "Página Dados e backup (link no rodapé): baixe um arquivo com seus bancos, tentativas, histórico e o formulário de Criar com IA, e restaure depois.",
        "Restaurar pode mesclar (acrescenta o que falta e nunca sobrescreve um banco diferente) ou substituir tudo, com confirmação. Se o armazenamento do navegador encher no meio, nada é alterado.",
        "Lembrete discreto de backup na Biblioteca quando há bancos ou resultados e faz mais de 30 dias do último backup (\"Depois\" adia 7 dias).",
        "Uso do armazenamento e pedido ao navegador para não apagar os dados.",
        "Importar mostra, antes de salvar, os números do banco, o gabarito por letra e todas as questões com a alternativa correta marcada e a explicação.",
        "Imprimir agora tem três saídas: Caderno de prova (sem gabarito, com campos de nome/data/turma e linhas para as discursivas), Gabarito (folha separada) e Prova corrigida.",
      ],
      changed: [
        "No papel o fundo é branco e a tinta preta; cada questão fica inteira na mesma página.",
      ],
      internal: [
        "Testes de ponta a ponta (Playwright + axe) agora fazem parte do repositório: `npm run e2e`. Cobrem navegação, criar, importar, prova, backup e impressão (gera PDF).",
        "CI no GitHub: tipos, testes unitários, build e E2E a cada push e pull request.",
        "ADR 0006 (backup) e 0007 (impressão); roteiro de teste com leitor de tela em docs/a11y-checklist.md.",
      ],
    },
  },
  {
    version: "0.4.1",
    date: "2026-11-25",
    summary: "Destaque das questões a rever mais suave, com fade-out.",
    changes: {
      changed: [
        "Ao navegar pelas questões a rever, o destaque agora é um brilho azul suave que entra rápido e se dissolve devagar, em vez de um contorno que some de repente.",
        "Com a opção do sistema \"reduzir movimento\", o destaque fica parado e discreto, sem animação.",
      ],
    },
  },
  {
    version: "0.4.0",
    date: "2026-11-25",
    summary: "Fórmulas matemáticas e químicas, navegação pelas questões a rever, botão de voltar ao topo e criador com \"Sem material\".",
    changes: {
      added: [
        "Fórmulas nas questões: escreva $x^2 + 3x = 10$ ou, em bloco, $$\\frac{a}{b}$$; química com $\\ce{H2O}$. Fontes e estilos vêm no próprio app, sem internet.",
        "Depois de corrigir a prova, o botão \"Revisar questões\" leva, em ordem, às erradas, em branco ou com nota baixa, destacando cada uma por um instante.",
        "Botão de voltar ao topo, que aparece quando o cabeçalho e o menu saem de vista.",
        "Em Criar com IA, a opção \"Sem material\": a IA busca referências no nível da série e dos assuntos, e o pedido e os textos de apoio se adaptam a imagens, texto ou nenhum material.",
        "Importar: botão \"Colar da área de transferência\", \"Limpar\" e contador de caracteres.",
        "Ajuda no campo \"Número de partes\".",
      ],
      changed: [
        "No campo Nível, as opções não selecionadas ficam apagadas e só a escolhida mostra a cor cheia.",
        "Os exemplos ficam sempre fechados na tela inicial, mesmo com a biblioteca vazia.",
        "A tela Importar ganhou dois passos numerados (arquivo ou texto) e um divisor \"ou\".",
        "O aviso \"Salvo no navegador\" tem faixa própria no topo e não empilha sob outros avisos.",
        "O simulado de Matemática do catálogo passou a usar fórmulas.",
      ],
      fixed: [
        "Uma barra invertida de fórmula sem dobrar no JSON (\\frac virava caractere de controle) agora é recusada na importação, com mensagem explicando como corrigir.",
      ],
      internal: [
        "KaTeX carregado sob demanda (só quando alguma questão tem fórmula); preços como \"R$ 5,00\" nunca são lidos como fórmula.",
        "Fórmulas têm nome acessível em português para leitores de tela (aria-label).",
        "Testes novos para fórmulas, revisão de questões, modo \"Sem material\" e validação de barra invertida.",
      ],
    },
  },
  {
    version: "0.3.0",
    date: "2026-11-24",
    summary: "Biblioteca focada nos seus bancos, catálogo de exemplos do 1º ao 9º ano e formulário mais claro.",
    changes: {
      added: [
        "Catálogo de exemplos: um simulado de 10 questões para cada matéria (Língua Portuguesa, Matemática, Ciências, História, Geografia, Língua Inglesa, Arte, Educação Física e Ensino Religioso), cobrindo do 1º ao 9º ano.",
        "Em Criar com IA, \"Assuntos\" agora é uma lista de etiquetas: adicione com Enter, vírgula ou botão e remova com um clique.",
        "Ícone \"?\" em Referência curricular explicando o que é e como achar a da escola.",
        "Aviso discreto \"Salvo no navegador\" no topo, algum tempo depois da última alteração.",
      ],
      changed: [
        "A tela inicial mostra primeiro os seus bancos; os exemplos ficam num painel que você abre quando quiser (abre sozinho enquanto a biblioteca está vazia).",
        "\"Versões\" saiu da navegação e foi para o rodapé.",
        "Avisos (toasts) aparecem no topo, com fade, e não cobrem mais os botões de baixo.",
        "Campos preenchidos têm fundo mais claro e uma barra de destaque, para diferenciar do vazio.",
        "Nível de dificuldade agora usa botões coloridos (verde, âmbar e vermelho) sempre acompanhados de texto.",
        "O simulado de História do protótipo foi substituído pelo catálogo; as revisões da escola continuam disponíveis em um grupo à parte.",
      ],
      internal: [
        "Etapa de ensino (Fundamental I e II) derivada do campo grade; incluir um banco novo no catálogo é um arquivo JSON mais uma linha no registro.",
        "Testes do catálogo: 10 questões por banco, um por ano de 1 a 9, 4 alternativas, gabarito equilibrado e nenhum aviso de qualidade.",
        "Novos componentes: HelpTip, TagInput e Segmented com tom.",
      ],
    },
  },
  {
    version: "0.2.0",
    date: "2026-11-24",
    summary: "Criar com IA por formulário, tema claro por padrão e nova base visual.",
    changes: {
      added: [
        "Criar com IA: campos para aluno, escola e simulado; o pedido para a IA é montado enquanto você digita e fica salvo no navegador.",
        "Pedido pronto para qualquer IA entender que você só enviará imagens (ou texto) e que ela deve devolver um único JSON.",
        "Validação dos campos com asterisco de obrigatório, destaque em vermelho e mensagem clara.",
        "Atalhos para Gemini, ChatGPT e Claude no fim da tela de criação.",
        "Botão para copiar um pedido de correção quando a importação encontra erros.",
        "Avisos na importação quando o gabarito está concentrado em uma letra ou a correta é sempre a mais longa.",
        "Confirmações em modal acessível e avisos rápidos (toasts) no lugar das caixas do navegador.",
        "Página de versões e mudanças.",
      ],
      changed: [
        "Tema claro (creme) por padrão, com troca apenas entre claro e escuro; o app não segue mais o tema do sistema.",
        "Interface reescrita com Tailwind CSS, ícones consistentes e layout fluido de celular a desktop.",
        "Fonte Atkinson Hyperlegible agora é carregada junto com o app, sem pedir nada a servidores externos.",
      ],
      internal: [
        "Código reorganizado em core (lógica pura), storage, exams, features, components, i18n e changelog.",
        "Estado da prova em um store Zustand por prova; cada questão só se redesenha quando a própria resposta muda.",
        "Tentativas e histórico lidos do navegador passam por validação Zod.",
        "Textos da interface num dicionário tipado; testes ao lado do código.",
        "Exportação estática (output export) ligada.",
      ],
    },
  },
  {
    version: "0.1.0",
    date: "2026-11-23",
    summary: "Primeira versão: importar, resolver e corrigir simulados a partir de um JSON.",
    changes: {
      added: [
        "Importar e exportar bancos de questões em JSON (formato versão 1) com validação em português.",
        "Prova em uma página com progresso, salvamento automático e retomada.",
        "Correção automática das objetivas e correção assistida das discursivas, sem nota final enquanto houver correção pendente.",
        "Histórico das últimas 30 tentativas, com exportação em JSON.",
        "Tema claro e escuro.",
        "Impressão básica.",
      ],
      data: [
        "Três bancos de exemplo de História do 5º ano, incluindo o da revisão da escola com 43 questões.",
      ],
    },
  },
];
