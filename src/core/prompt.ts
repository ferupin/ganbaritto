import { z } from "zod";
import { templateExam } from "./template";

/**
 * Pedido para a IA montado a partir dos campos que a pessoa preenche.
 * Módulo puro: sem React e sem armazenamento. A tela só mostra e guarda o resultado.
 */

const str = (fallback = "") => z.string().catch(fallback);

/** Campos do formulário. Cada campo tem um valor de reserva, então dados antigos ou estragados nunca quebram a tela. */
export const CreatorSchema = z.object({
  // Aluno e escola: mudam raramente, ficam salvos entre simulados.
  age: str(),
  grade: str(),
  institution: str(),
  city: str(),
  curriculum: str("BNCC"),
  studentNotes: str(),
  // Este simulado.
  subject: str(),
  title: str(),
  topics: str(),
  materials: str(),
  inputMode: z.enum(["images", "text", "none"]).catch("images"),
  objectiveCount: str(),
  openCount: str("0"),
  partsCount: str(),
  difficulty: z.enum(["revisao", "medio", "desafio"]).catch("revisao"),
  extraStyle: str(),
  allowExternal: z.boolean().catch(false),
  mimicSchool: z.boolean().catch(true),
});

export type CreatorFields = z.output<typeof CreatorSchema>;

export const defaultFields: CreatorFields = CreatorSchema.parse({});

const SIMULADO_KEYS = [
  "subject",
  "title",
  "topics",
  "materials",
  "inputMode",
  "objectiveCount",
  "openCount",
  "partsCount",
  "difficulty",
  "extraStyle",
  "allowExternal",
  "mimicSchool",
] as const;

/** "Novo simulado": limpa só os campos do simulado e mantém aluno e escola. */
export function resetSimulado(f: CreatorFields): CreatorFields {
  return {
    ...f,
    ...Object.fromEntries(SIMULADO_KEYS.map((k) => [k, defaultFields[k]])),
  } as CreatorFields;
}

/** Campos sem os quais o pedido fica com lacunas "[PREENCHER: …]". */
export function missingRequired(f: CreatorFields): string[] {
  const out: string[] = [];
  if (!f.grade.trim()) out.push("série ou ano");
  if (!f.subject.trim()) out.push("disciplina");
  return out;
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

function toInt(s: string): number | undefined {
  const n = Number.parseInt(s.trim(), 10);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 200) : undefined;
}

function clip(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
}

const lines = (s: string) =>
  s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

/** Esqueleto do JSON já preenchido com o que a pessoa digitou. */
export function buildSkeleton(f: CreatorFields) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sk = structuredClone(templateExam) as any;
  const subject = f.subject.trim();
  const slug = slugify(
    f.title.trim() || [subject, f.grade.trim()].filter(Boolean).join(" "),
  );
  sk.id = `${slug || "simulado"}-v1`;
  sk.title = f.title.trim() || (subject ? `Simulado de ${subject}` : "Simulado");
  sk.subject = subject || "Disciplina";
  if (f.grade.trim()) sk.grade = f.grade.trim();
  else delete sk.grade;
  if (f.institution.trim()) sk.institution = f.institution.trim();
  else delete sk.institution;
  const topics = lines(f.topics).join("; ");
  if (topics) sk.description = clip(`Conteúdo: ${topics}`, 160);

  const mats = lines(f.materials);
  const none = f.inputMode === "none";
  sk.sources.providedMaterial = mats.length
    ? mats
    : [
        none
          ? "Nenhum material enviado; referências escolhidas pela IA"
          : f.inputMode === "images"
            ? "Imagens enviadas pelo responsável"
            : "Texto enviado pelo responsável",
      ];
  sk.sources.onlyProvidedMaterial = !f.allowExternal && !none;

  if ((toInt(f.openCount) ?? 0) === 0) {
    sk.parts[0].questions = sk.parts[0].questions.filter(
      (q: { type: string }) => q.type !== "open",
    );
  }
  return sk as typeof templateExam;
}

const LEVEL: Record<CreatorFields["difficulty"], string> = {
  revisao:
    "mesmo nível das revisões da escola: enunciado contextualizado, direto, sem pegadinhas.",
  medio:
    "um pouco acima da revisão: exige interpretar e relacionar conceitos, ainda sem pegadinhas.",
  desafio:
    "desafiador para a série: exige aplicar o conteúdo em situações novas e comparar conceitos próximos.",
};

export function buildPrompt(f: CreatorFields): string {
  const need = (v: string, label: string) =>
    v.trim() || `[PREENCHER: ${label}]`;
  const images = f.inputMode === "images";
  const none = f.inputMode === "none";
  const external = f.allowExternal || none;
  const objective = toInt(f.objectiveCount);
  const open = toInt(f.openCount) ?? 0;
  const parts = toInt(f.partsCount);
  const mats = lines(f.materials);
  const topics = lines(f.topics);
  const blocks: string[] = [];

  blocks.push(
    `Você vai criar um simulado escolar interativo como um ARQUIVO JSON, seguindo EXATAMENTE o esqueleto da seção "Esqueleto" (no final). ${
      none
        ? "Eu NÃO vou enviar material (nem imagens nem texto). Você monta o simulado a partir do contexto abaixo (série, disciplina, assuntos e referência curricular) e de referências confiáveis."
        : images
          ? "Eu só vou te enviar IMAGENS (fotos de páginas do livro, revisões da escola, cadernos). Você lê, organiza e monta tudo."
          : "Eu só vou te enviar o TEXTO do material. Você organiza e monta tudo."
    }`,
  );

  blocks.push(
    (none
      ? [
          "# Como vamos trabalhar",
          '1. Não há material para ler. Se faltar algo essencial (série, disciplina ou assuntos), pergunte ANTES de gerar. Caso contrário, gere direto.',
          "2. Construa o conteúdo com base na série, na referência curricular e nos assuntos informados, no nível que se espera para esse ano. Não invente fatos.",
          "3. Gere o simulado. Responda SOMENTE com um único bloco de código JSON, sem texto antes ou depois.",
          "4. Se eu colar mensagens de erro de validação, corrija apenas o que foi apontado e devolva o JSON COMPLETO.",
        ]
      : [
          "# Como vamos trabalhar",
          images
            ? '1. Depois de ler este pedido, responda apenas: "Pronto, pode enviar as imagens." (Se as imagens já vieram junto com este pedido, pule para o passo 3.)'
            : '1. Depois de ler este pedido, responda apenas: "Pronto, pode enviar o texto." (Se o texto já veio junto com este pedido, pule para o passo 3.)',
          images
            ? '2. Eu envio as imagens em uma ou mais mensagens. Se vierem em mais de uma, responda só "Recebido (N imagens)" a cada mensagem e espere eu escrever GERAR.'
            : '2. Eu envio o texto em uma ou mais mensagens. Se vierem em mais de uma, responda só "Recebido" a cada mensagem e espere eu escrever GERAR.',
          images
            ? "3. Leia todo o texto das imagens. Se alguma estiver ilegível, cortada, de cabeça para baixo ou ambígua, liste exatamente quais e pergunte ANTES de gerar. Não adivinhe nem invente trechos."
            : "3. Leia todo o material. Se algo estiver incompleto ou ambíguo, liste o que falta e pergunte ANTES de gerar. Não adivinhe nem invente trechos.",
          "4. Gere o simulado. Responda SOMENTE com um único bloco de código JSON, sem texto antes ou depois.",
          "5. Se eu colar mensagens de erro de validação, corrija apenas o que foi apontado e devolva o JSON COMPLETO.",
        ]
    ).join("\n"),
  );

  if (images) {
    blocks.push(
      [
        "# Sobre as imagens",
        "- Se forem uma revisão ou prova da escola: transcreva as questões com fidelidade (corrija só erros óbvios de digitação), complete com novas questões no mesmo estilo e nível, e diga em sources.notes quais vieram da revisão.",
        "- Se o gabarito oficial não aparecer, deduza pelo conteúdo e escreva em sources.notes que o gabarito precisa de conferência com a escola. Marcas a lápis ou caneta do aluno NÃO são gabarito.",
        "- Se forem páginas de livro, o conteúdo do simulado deve vir delas.",
      ].join("\n"),
    );
  }

  blocks.push(
    [
      "# Perfil do aluno e da escola",
      `- Série/ano: ${need(f.grade, "série ou ano")}`,
      f.age.trim() && `- Idade: ${f.age.trim()}`,
      f.institution.trim() && `- Escola: ${f.institution.trim()}`,
      f.city.trim() && `- Cidade/UF: ${f.city.trim()}`,
      f.curriculum.trim() &&
        `- Referência curricular: ${f.curriculum.trim()} (orienta a adequação das habilidades à série; não substitui o conteúdo do material)`,
      f.studentNotes.trim() && `- Observações sobre o aluno: ${f.studentNotes.trim()}`,
      none
        ? "Adeque linguagem, complexidade e exemplos a essa série e à referência curricular. Como não há material, o conteúdo vem dos assuntos listados e de referências confiáveis para esse ano. Não invente informações."
        : "Adeque linguagem, complexidade e exemplos a essa série. O conteúdo específico vem do MATERIAL que eu enviar. Não contradiga o material nem invente informações.",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  blocks.push(
    [
      "# Este simulado",
      `- Disciplina: ${need(f.subject, "disciplina")}`,
      f.title.trim() && `- Título desejado: ${f.title.trim()}`,
      topics.length > 0 &&
        `- Assuntos e programa:\n${topics.map((t) => `  - ${t}`).join("\n")}`,
      mats.length > 0 &&
        `- Material de estudo (livro, capítulos, páginas):\n${mats.map((t) => `  - ${t}`).join("\n")}`,
      `- Questões objetivas: ${
        objective
          ? `${objective}`
          : "a quantidade necessária para cobrir o conteúdo de forma equilibrada (referência ~20; pode ser 30, 35 ou mais)"
      }`,
      open > 0
        ? `- Questões discursivas: ${open} (type "open", com resposta esperada, conceitos essenciais e critérios)`
        : '- Questões discursivas: nenhuma. Use somente múltipla escolha (type "multiple_choice").',
      parts
        ? `- Organização: exatamente ${parts} parte(s) temática(s).`
        : "- Organização: agrupe em partes temáticas coerentes.",
      `- Nível: ${LEVEL[f.difficulty]}`,
      f.extraStyle.trim() && `- Pedidos extras: ${f.extraStyle.trim()}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  blocks.push(
    [
      "# Como elaborar as questões",
      none
        ? "1. Levante os assuntos, conceitos, datas, personagens e exemplos que esse ano escolar costuma trabalhar nos assuntos informados, segundo a referência curricular."
        : "1. Levante todos os assuntos, conceitos, datas, personagens e exemplos do material.",
      "2. Agrupe em partes temáticas (campo \"parts\") e cubra o conteúdo de forma equilibrada, sem repetições desnecessárias.",
      "3. Ajuste linguagem e profundidade à série. Linguagem clara, acolhedora e educativa.",
      "4. Construa gabarito, explicações e critérios ANTES de entregar.",
      f.mimicSchool
        ? '5. Estilo das revisões da escola: múltipla escolha com 4 alternativas (ids "a","b","c","d"), apenas UMA correta; enunciado contextualizado, com uma situação do dia a dia, definição ou exemplo concreto em 1 ou 2 frases (campo "context") antes da pergunta ("prompt"); sem pegadinhas e sem vocabulário técnico excessivo; avalie compreensão, interpretação e finalidade, não só memorização; inclua situações práticas de cidadania, convivência e respeito à diversidade quando o conteúdo permitir.'
        : '5. Múltipla escolha com 4 alternativas (ids "a","b","c","d"), apenas UMA correta. Enunciados claros, sem pegadinhas.',
      "6. Alternativas erradas plausíveis e não ambíguas: explorem confusões comuns entre conceitos próximos ou atitudes claramente incoerentes com o conteúdo.",
      '7. Afirmativas I, II, III, IV: use o campo "statements" (a numeração romana é automática, NÃO escreva "I." no texto) com alternativas do tipo "Apenas I e II estão corretas".',
      '8. Tabelas ou dados: use o campo "table" ({ "headers": [...], "rows": [[...]] }).',
      '9. Toda questão objetiva precisa de "explanation" (explicação comentada, em linguagem simples).',
      open > 0
        ? '10. Discursivas: inclua "expectedAnswer" (modelo de resposta), "keyConcepts", "criteria" (a correção NÃO é por palavra-chave) e "maxPoints" 3 (rubrica de 0 a 3).'
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  blocks.push(
    [
      "# Fórmulas e símbolos",
      "- Quando a matéria pedir (matemática, física, química, geometria), escreva as fórmulas em LaTeX entre cifrões: $x^2 + 3x = 10$ no meio do texto e $$\\frac{a}{b}$$ em bloco. Química: $\\ce{H2O}$.",
      '- No JSON a barra invertida precisa ser DOBRADA: "$\\\\frac{1}{2}$", "$\\\\times$", "$\\\\theta$". Com uma barra só, o JSON quebra a fórmula em silêncio.',
      "- Não escreva símbolos matemáticos soltos fora dos cifrões (≤, ≥, ≠, π, √): coloque dentro da fórmula.",
      '- Valores em reais ficam como texto normal: "R$ 5,00" (com espaço depois de R$), sem cifrão extra.',
      '- Não desenhe gráficos nem figuras. Descreva a situação em "context" ou use "table" para dados.',
    ].join("\n"),
  );

  blocks.push(
    [
      "# Confira antes de responder",
      '- Cada "answer" é o id de uma alternativa que existe na mesma questão.',
      "- Ids de questões únicos em todo o arquivo (q01, q02, …).",
      "- A alternativa correta está distribuída de forma equilibrada entre a, b, c e d: nenhuma letra em mais de 30% das questões objetivas. Nas questões de afirmativas, siga a lógica do conteúdo.",
      "- A alternativa correta NÃO é sempre a mais longa ou a mais detalhada. Alternativas erradas com tamanho e riqueza parecidos com a correta.",
      "- Só uma alternativa correta por questão.",
      "- JSON válido: aspas duplas, sem vírgula sobrando, sem comentários. Substitua TODOS os textos de exemplo do esqueleto.",
    ].join("\n"),
  );

  blocks.push(
    [
      "# Fontes",
      mats.length > 0
        ? '- Preencha "sources.providedMaterial" com o material que eu informei acima.'
        : none
          ? '- Preencha "sources.providedMaterial" com "Nenhum material enviado; referências escolhidas pela IA".'
          : '- Preencha "sources.providedMaterial" com o material que eu enviar.',
      none
        ? '- Como não há material, busque referências confiáveis no nível do que foi descrito acima (série, referência curricular e assuntos): documento curricular oficial, livros didáticos e materiais educacionais reconhecidos. Liste em "external" SOMENTE as que realmente consultou, com link e data de acesso, e use "onlyProvidedMaterial": false. Se você não tiver acesso à internet, use seu conhecimento geral do conteúdo desse ano, deixe "external" vazio e escreva em "sources.notes" que não houve consulta e que o conteúdo precisa de conferência pelo responsável.'
        : external
          ? '- Você pode consultar fontes confiáveis para verificar fatos. Liste em "external" SOMENTE as que realmente consultou, com link e data de acesso, e use "onlyProvidedMaterial": false.'
          : '- Use SOMENTE o material que eu enviar: "onlyProvidedMaterial": true e "external" vazio. Não consulte nem cite fontes externas.',
      "- NUNCA invente referências, páginas ou links.",
    ].join("\n"),
  );

  blocks.push(
    [
      "# Esqueleto (já preenchido com os meus dados; mantenha os campos id, title, subject, grade e institution)",
      JSON.stringify(buildSkeleton(f), null, 2),
    ].join("\n"),
  );

  return blocks.join("\n\n");
}

/** Pedido para devolver à IA quando o app encontrou problemas no JSON. */
export function buildFixPrompt(errors: string[]): string {
  return [
    "O JSON que você gerou não passou na validação do app. Corrija APENAS os problemas abaixo, sem mudar o restante, e devolva o JSON COMPLETO corrigido em um único bloco de código JSON, sem texto antes ou depois.",
    "",
    "Problemas encontrados:",
    ...errors.map((e) => `- ${e}`),
    "",
    'Lembretes: cada "answer" deve ser o id de uma alternativa da mesma questão; os ids de questões são únicos no arquivo; "type" é "multiple_choice" ou "open"; aspas duplas e sem vírgula sobrando.',
  ].join("\n");
}
