import { z } from "zod";
import { P, readRaw, writeRaw } from "./local";

const attemptKey = (examId: string) => `${P}.attempt.${examId}`;
const historyKey = (examId: string) => `${P}.history.${examId}`;

export const HISTORY_LIMIT = 30;

const GradeSchema = z.object({
  points: z.number().optional(),
  comment: z.string().optional(),
});

export const AttemptSchema = z.object({
  /** Identifica a tentativa (momento em que começou). */
  attemptId: z.string(),
  answers: z.record(z.string(), z.string()).catch({}),
  grades: z.record(z.string(), GradeSchema).catch({}),
  finished: z.boolean().catch(false),
  finishedAt: z.string().optional(),
  updatedAt: z.string(),
});
export type Attempt = z.output<typeof AttemptSchema>;

export function newAttempt(): Attempt {
  const now = new Date().toISOString();
  return {
    attemptId: now,
    answers: {},
    grades: {},
    finished: false,
    updatedAt: now,
  };
}

/** Sempre devolve uma tentativa válida: dado salvo estragado vira tentativa nova. */
export function loadAttempt(examId: string): Attempt {
  const r = AttemptSchema.safeParse(readRaw(attemptKey(examId)));
  return r.success ? r.data : newAttempt();
}

export function saveAttempt(examId: string, attempt: Attempt): boolean {
  return writeRaw(attemptKey(examId), {
    ...attempt,
    updatedAt: new Date().toISOString(),
  });
}

export const HistoryEntrySchema = z.object({
  attemptId: z.string(),
  date: z.string(),
  hits: z.number(),
  objectiveTotal: z.number(),
  objectivePercent: z.number(),
  earned: z.number(),
  max: z.number(),
  /** % geral; só definitivo se final === true. */
  percent: z.number(),
  final: z.boolean(),
});
export type HistoryEntry = z.output<typeof HistoryEntrySchema>;

export function loadHistory(examId: string): HistoryEntry[] {
  const raw = readRaw(historyKey(examId));
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((x) => {
    const r = HistoryEntrySchema.safeParse(x);
    return r.success ? [r.data] : [];
  });
}

/** Insere ou atualiza (mesmo attemptId) e mantém só as últimas 30. */
export function upsertHistory(examId: string, entry: HistoryEntry): boolean {
  const h = loadHistory(examId).filter((x) => x.attemptId !== entry.attemptId);
  h.push(entry);
  h.sort((a, b) => a.date.localeCompare(b.date));
  return writeRaw(historyKey(examId), h.slice(-HISTORY_LIMIT));
}
