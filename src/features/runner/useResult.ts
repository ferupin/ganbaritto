import { useMemo } from "react";
import type { Exam } from "@/core/schema";
import { computeResult } from "@/core/score";
import { useRunner } from "./store";

/** Resultado da tentativa atual. Recalcula só quando respostas ou correções mudam. */
export function useResult(exam: Exam) {
  const answers = useRunner(exam.id, (s) => s.attempt.answers);
  const grades = useRunner(exam.id, (s) => s.attempt.grades);
  return useMemo(() => computeResult(exam, answers, grades), [exam, answers, grades]);
}
