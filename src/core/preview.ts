import type { Exam } from "./schema";
import { allQuestions } from "./score";
import { hasMath } from "./math";

export interface ExamSummary {
  total: number;
  objective: number;
  open: number;
  /** Quantas objetivas têm cada letra como gabarito (a..d, na ordem das alternativas). */
  answerLetters: Record<string, number>;
  parts: { id: string; title: string; count: number }[];
  withTable: number;
  withMath: number;
  /** Pontos máximos das discursivas somados. */
  openMaxPoints: number;
}

/** Números para conferir um banco antes de salvar. Puro. */
export function summarizeExam(exam: Exam): ExamSummary {
  const qs = allQuestions(exam);
  const letters: Record<string, number> = {};
  let withMath = 0;
  let withTable = 0;
  let openMax = 0;
  for (const q of qs) {
    if (q.type === "multiple_choice") {
      const idx = q.options.findIndex((o) => o.id === q.answer);
      const letter = String.fromCharCode(97 + idx);
      letters[letter] = (letters[letter] ?? 0) + 1;
    } else {
      openMax += q.maxPoints;
    }
    if (q.table) withTable++;
    const texts = [
      q.context,
      q.prompt,
      ...(q.type === "multiple_choice" ? [...q.options.map((o) => o.text), ...(q.statements ?? []), q.explanation] : [q.expectedAnswer]),
    ];
    if (texts.some((x) => x && hasMath(x))) withMath++;
  }
  return {
    total: qs.length,
    objective: qs.filter((q) => q.type === "multiple_choice").length,
    open: qs.filter((q) => q.type === "open").length,
    answerLetters: letters,
    parts: exam.parts.map((p) => ({ id: p.id, title: p.title, count: p.questions.length })),
    withTable,
    withMath,
    openMaxPoints: openMax,
  };
}
