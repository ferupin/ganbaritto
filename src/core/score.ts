import type { Exam, McQuestion, OpenQuestion, Question } from "./schema";

/** Respostas do aluno: id da questão -> id da alternativa (mc) ou texto (open). */
export type Answers = Record<string, string>;

/** Correção manual/assistida das discursivas: id da questão -> pontos + comentário. */
export type Grades = Record<string, { points?: number; comment?: string }>;

export function allQuestions(exam: Exam): Question[] {
  return exam.parts.flatMap((p) => p.questions);
}

export function isAnswered(q: Question, answers: Answers): boolean {
  const a = answers[q.id];
  return typeof a === "string" && a.trim().length > 0;
}

export function countAnswered(exam: Exam, answers: Answers): number {
  return allQuestions(exam).filter((q) => isAnswered(q, answers)).length;
}

export interface Result {
  objective: {
    total: number;
    hits: number;
    unanswered: number;
    earned: number;
    max: number;
  };
  open: {
    total: number;
    graded: number;
    /** Discursivas respondidas que ainda aguardam a nota do responsável. */
    pending: number;
    earned: number;
    max: number;
  };
  earned: number;
  max: number;
  /** true só quando não há discursivas pendentes de avaliação. */
  final: boolean;
  /** % apenas das objetivas (correção automática). */
  objectivePercent: number;
  /** % geral. Só é "definitiva" quando final === true. */
  percent: number;
}

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

export function computeResult(
  exam: Exam,
  answers: Answers,
  grades: Grades,
): Result {
  const qs = allQuestions(exam);
  const mcs = qs.filter((q): q is McQuestion => q.type === "multiple_choice");
  const opens = qs.filter((q): q is OpenQuestion => q.type === "open");

  let hits = 0;
  let unanswered = 0;
  let objEarned = 0;
  let objMax = 0;
  for (const q of mcs) {
    objMax += q.points;
    const a = answers[q.id];
    if (!a) unanswered++;
    else if (a === q.answer) {
      hits++;
      objEarned += q.points;
    }
  }

  let graded = 0;
  let pending = 0;
  let openEarned = 0;
  let openMax = 0;
  for (const q of opens) {
    openMax += q.maxPoints;
    if (!isAnswered(q, answers)) {
      // Sem resposta = 0 pela rubrica ("não respondeu"); não fica pendente.
      graded++;
      continue;
    }
    const g = grades[q.id];
    if (g && typeof g.points === "number" && Number.isFinite(g.points)) {
      graded++;
      openEarned += Math.min(Math.max(g.points, 0), q.maxPoints);
    } else {
      pending++;
    }
  }

  const earned = objEarned + openEarned;
  const max = objMax + openMax;
  return {
    objective: {
      total: mcs.length,
      hits,
      unanswered,
      earned: objEarned,
      max: objMax,
    },
    open: {
      total: opens.length,
      graded,
      pending,
      earned: openEarned,
      max: openMax,
    },
    earned,
    max,
    final: pending === 0,
    objectivePercent: pct(objEarned, objMax),
    percent: pct(earned, max),
  };
}

/**
 * Questões para revisar depois da correção, na ordem da prova:
 * objetivas erradas ou em branco; discursivas em branco ou com nota abaixo do máximo.
 * Discursiva respondida e ainda sem nota não entra (não se sabe se errou).
 */
export function reviewTargets(exam: Exam, answers: Answers, grades: Grades): string[] {
  return allQuestions(exam)
    .filter((q) => {
      if (q.type === "multiple_choice") return answers[q.id] !== q.answer;
      if (!isAnswered(q, answers)) return true;
      const points = grades[q.id]?.points;
      return points !== undefined && points < q.maxPoints;
    })
    .map((q) => q.id);
}
