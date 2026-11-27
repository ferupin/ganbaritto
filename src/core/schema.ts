import { z } from "zod";
import { findBrokenBackslash } from "./math";

/**
 * Formato JSON v1 de um simulado ("banco de questões").
 * É este o contrato que uma LLM deve seguir ao gerar um banco.
 */

const nonEmpty = (label: string) =>
  z.string().trim().min(1, `${label} não pode ficar vazio`);

const OptionSchema = z.object({
  id: nonEmpty("o id da alternativa"),
  text: nonEmpty("o texto da alternativa"),
});

const TableSchema = z
  .object({
    caption: z.string().optional(),
    headers: z.array(z.string()).min(1),
    rows: z.array(z.array(z.string())).min(1),
  })
  .superRefine((t, ctx) => {
    t.rows.forEach((row, i) => {
      if (row.length !== t.headers.length) {
        ctx.addIssue({
          code: "custom",
          path: ["rows", i],
          message: `a linha tem ${row.length} célula(s), mas a tabela tem ${t.headers.length} coluna(s)`,
        });
      }
    });
  });

const MultipleChoiceSchema = z
  .object({
    type: z.literal("multiple_choice"),
    id: nonEmpty("o id da questão"),
    title: z.string().optional(),
    /** Texto de apoio / situação do cotidiano antes da pergunta. */
    context: z.string().optional(),
    prompt: nonEmpty("o enunciado"),
    /** Afirmativas I, II, III, IV (a numeração romana é automática). */
    statements: z.array(nonEmpty("a afirmativa")).optional(),
    table: TableSchema.optional(),
    options: z.array(OptionSchema).min(2).max(6),
    /** id da alternativa correta (ex.: "a"). */
    answer: nonEmpty("a resposta"),
    explanation: nonEmpty("a explicação"),
    points: z.number().positive().default(1),
  })
  .superRefine((q, ctx) => {
    const ids = q.options.map((o) => o.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "há ids de alternativas repetidos",
      });
    }
    if (!ids.includes(q.answer)) {
      ctx.addIssue({
        code: "custom",
        path: ["answer"],
        message: `a resposta "${q.answer}" não corresponde a nenhuma alternativa (${ids.join(", ")})`,
      });
    }
  });

const OpenSchema = z.object({
  type: z.literal("open"),
  id: nonEmpty("o id da questão"),
  title: z.string().optional(),
  context: z.string().optional(),
  prompt: nonEmpty("o enunciado"),
  table: TableSchema.optional(),
  /** Modelo de resposta para o responsável comparar. */
  expectedAnswer: nonEmpty("a resposta esperada"),
  /** Conceitos essenciais que a resposta deve conter. */
  keyConcepts: z.array(z.string()).default([]),
  /** Critérios de avaliação (a correção NÃO é por palavra-chave). */
  criteria: z.array(nonEmpty("o critério")).min(1),
  /** Pontuação máxima da rubrica (padrão 0 a 3). */
  maxPoints: z.number().int().positive().default(3),
});

const QuestionSchema = z.discriminatedUnion("type", [
  MultipleChoiceSchema,
  OpenSchema,
]);

const ExternalSourceSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
  accessedAt: z.string().optional(),
  relatedQuestions: z.array(z.string()).optional(),
});

const PartSchema = z.object({
  id: nonEmpty("o id da parte"),
  title: nonEmpty("o título da parte"),
  questions: z.array(QuestionSchema).min(1),
});

export const ExamSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z
      .string()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "o id deve usar só letras minúsculas, números e hífens (ex.: historia-5ano-v1)",
      ),
    title: nonEmpty("o título"),
    subject: nonEmpty("a disciplina"),
    grade: z.string().optional(),
    institution: z.string().optional(),
    description: z.string().optional(),
    /** Registro de fontes. Declare se foi feito só com o material fornecido. */
    sources: z
      .object({
        providedMaterial: z.array(z.string()).default([]),
        onlyProvidedMaterial: z.boolean().optional(),
        external: z.array(ExternalSourceSchema).default([]),
        notes: z.string().optional(),
      })
      .optional(),
    parts: z.array(PartSchema).min(1),
  })
  .superRefine((exam, ctx) => {
    const seen = new Set<string>();
    exam.parts.forEach((p, pi) =>
      p.questions.forEach((q, qi) => {
        if (seen.has(q.id)) {
          ctx.addIssue({
            code: "custom",
            path: ["parts", pi, "questions", qi, "id"],
            message: `o id "${q.id}" já foi usado em outra questão`,
          });
        }
        seen.add(q.id);
      }),
    );
  });

export type Exam = z.output<typeof ExamSchema>;
export type Part = Exam["parts"][number];
export type Question = Part["questions"][number];
export type McQuestion = Extract<Question, { type: "multiple_choice" }>;
export type OpenQuestion = Extract<Question, { type: "open" }>;

/* ------------------------------------------------------------------ */
/* Validação com mensagens em português                                */
/* ------------------------------------------------------------------ */

function prettyPath(path: ReadonlyArray<PropertyKey>): string {
  const out: string[] = [];
  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    const next = path[i + 1];
    if (p === "parts" && typeof next === "number") {
      out.push(`Parte ${next + 1}`);
      i++;
    } else if (p === "questions" && typeof next === "number") {
      out.push(`Questão ${next + 1}`);
      i++;
    } else if (p === "options" && typeof next === "number") {
      out.push(`alternativa ${next + 1}`);
      i++;
    } else if (typeof p === "number") {
      out.push(`item ${p + 1}`);
    } else {
      out.push(String(p));
    }
  }
  return out.join(" › ") || "arquivo";
}

const TYPE_PT: Record<string, string> = {
  string: "texto",
  number: "número",
  boolean: "verdadeiro/falso",
  array: "lista",
  object: "objeto",
};

function translate(issue: z.core.$ZodIssue): string {
  const msg = issue.message;
  // Mensagens que escrevemos (minúsculas, em português) passam direto.
  if (/^[a-zà-ú]/.test(msg)) return msg;
  const last = issue.path[issue.path.length - 1];
  switch (issue.code) {
    case "invalid_type":
      return msg.includes("received undefined")
        ? "campo obrigatório ausente"
        : `tipo incorreto (esperado: ${TYPE_PT[issue.expected] ?? issue.expected})`;
    case "too_small":
      return issue.origin === "array"
        ? `precisa ter pelo menos ${issue.minimum} item(ns)`
        : issue.origin === "string"
          ? "não pode ficar vazio"
          : `deve ser maior ou igual a ${issue.minimum}`;
    case "too_big":
      return issue.origin === "array"
        ? `pode ter no máximo ${issue.maximum} item(ns)`
        : `deve ser menor ou igual a ${issue.maximum}`;
    case "invalid_value":
      return `valor inválido (aceitos: ${issue.values.map(String).join(", ")})`;
    case "invalid_union":
      return last === "type"
        ? 'tipo de questão inválido: use "multiple_choice" ou "open"'
        : "formato inválido";
    default:
      return "valor inválido";
  }
}

export function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((i) => `${prettyPath(i.path)}: ${translate(i)}`);
}

/** Remove cercas de código (```json) que LLMs costumam adicionar. */
export function extractJson(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fence ? fence[1] : trimmed;
}

export type ParseResult =
  | { ok: true; exam: Exam; warnings: string[] }
  | { ok: false; errors: string[] };

export function validateExam(raw: unknown): ParseResult {
  const parsed = ExamSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error) };
  const exam = parsed.data;
  const broken = brokenBackslashes(exam);
  if (broken.length > 0) return { ok: false, errors: broken };
  const warnings: string[] = [];
  exam.parts.forEach((p, pi) =>
    p.questions.forEach((q, qi) => {
      if (q.type === "multiple_choice" && q.options.length !== 4) {
        warnings.push(
          `Parte ${pi + 1} › Questão ${qi + 1}: o padrão é ter 4 alternativas (tem ${q.options.length}).`,
        );
      }
    }),
  );
  warnings.push(...balanceWarnings(exam));
  return { ok: true, exam, warnings };
}

/** Fórmula com "\\frac" sem dobrar a barra vira caractere de controle no JSON. */
function brokenBackslashes(node: unknown, path = "exame", out: string[] = []): string[] {
  if (out.length >= 10) return out;
  if (typeof node === "string") {
    const bad = findBrokenBackslash(node);
    if (bad) {
      out.push(
        `${path}: há um caractere de controle perto de “${bad}”. Provável barra invertida de fórmula sem dobrar: em JSON, escreva \\\\frac em vez de \\frac (vale para \\times, \\theta, \\beta, \\rightarrow…).`,
      );
    }
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => brokenBackslashes(v, `${path}[${i + 1}]`, out));
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) brokenBackslashes(v, `${path} › ${k}`, out);
  }
  return out;
}

/** Bancos feitos por IA costumam concentrar o gabarito em "A" e deixar a correta mais longa. */
function balanceWarnings(exam: Exam): string[] {
  const mcs = exam.parts
    .flatMap((p) => p.questions)
    .filter((q): q is McQuestion => q.type === "multiple_choice");
  if (mcs.length < 8) return [];
  const out: string[] = [];
  const count: Record<string, number> = {};
  let longest = 0;
  for (const q of mcs) {
    const idx = q.options.findIndex((o) => o.id === q.answer);
    const letter = String.fromCharCode(97 + idx);
    count[letter] = (count[letter] ?? 0) + 1;
    const len = (id: string) => q.options.find((o) => o.id === id)?.text.length ?? 0;
    const correct = len(q.answer);
    if (q.options.every((o) => o.id === q.answer || len(o.id) < correct)) longest++;
  }
  const [top, n] = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
  if (n / mcs.length > 0.4) {
    out.push(
      `A alternativa "${top.toUpperCase()}" é a correta em ${n} de ${mcs.length} questões (${Math.round((100 * n) / mcs.length)}%). Peça à IA para distribuir melhor o gabarito.`,
    );
  }
  if (longest / mcs.length > 0.6) {
    out.push(
      `A alternativa correta é a mais longa em ${longest} de ${mcs.length} questões. Isso entrega a resposta; peça à IA para equilibrar o tamanho das alternativas.`,
    );
  }
  return out;
}

export function parseExamJson(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(extractJson(text));
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      errors: [
        `O texto não é um JSON válido (${detail}). Confira vírgulas, aspas e chaves.`,
      ],
    };
  }
  return validateExam(raw);
}
