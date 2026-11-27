import { describe, expect, it } from "vitest";
import { validateExam } from "./schema";
import { computeResult, reviewTargets } from "./score";
import historia from "./fixtures/exam-35q-com-discursivas.json";

describe("pontuação", () => {
  const r = validateExam(historia);
  if (!r.ok) throw new Error("inválido");
  const exam = r.exam;
  const qs = exam.parts.flatMap((p) => p.questions);

  it("gabarito perfeito nas objetivas = 30/30, mas NÃO é final com discursivas pendentes", () => {
    const answers: Record<string, string> = {};
    for (const q of qs) {
      answers[q.id] = q.type === "multiple_choice" ? q.answer : "resposta do aluno";
    }
    const res = computeResult(exam, answers, {});
    expect(res.objective.hits).toBe(30);
    expect(res.objectivePercent).toBe(100);
    expect(res.open.pending).toBe(5);
    expect(res.final).toBe(false);
  });

  it("vira final e soma os pontos quando as 5 discursivas são corrigidas", () => {
    const answers: Record<string, string> = {};
    const grades: Record<string, { points: number }> = {};
    for (const q of qs) {
      if (q.type === "multiple_choice") answers[q.id] = q.answer;
      else {
        answers[q.id] = "texto";
        grades[q.id] = { points: 3 };
      }
    }
    const res = computeResult(exam, answers, grades);
    expect(res.final).toBe(true);
    expect(res.earned).toBe(45);
    expect(res.percent).toBe(100);
  });

  it("discursiva em branco vale 0 e não fica pendente", () => {
    const res = computeResult(exam, {}, {});
    expect(res.open.pending).toBe(0);
    expect(res.final).toBe(true);
    expect(res.earned).toBe(0);
    expect(res.objective.unanswered).toBe(30);
  });

  it("limita a nota da discursiva ao máximo da rubrica", () => {
    const open = qs.find((q) => q.type === "open")!;
    const res = computeResult(exam, { [open.id]: "x" }, { [open.id]: { points: 99 } });
    expect(res.open.earned).toBe(3);
  });

  it("revisão lista objetivas erradas/em branco e discursivas abaixo do máximo, em ordem", () => {
    const mc = qs.filter((q) => q.type === "multiple_choice");
    const open = qs.filter((q) => q.type === "open");
    const answers: Record<string, string> = {};
    for (const q of mc) answers[q.id] = q.answer;
    // erra a 2ª, deixa a 5ª em branco
    answers[mc[1].id] = mc[1].options.find((o) => o.id !== mc[1].answer)!.id;
    delete answers[mc[4].id];
    // 1ª discursiva respondida e sem nota; 2ª com nota máxima; 3ª com nota baixa; 4ª e 5ª em branco
    answers[open[0].id] = "texto";
    answers[open[1].id] = "texto";
    answers[open[2].id] = "texto";
    const grades = {
      [open[1].id]: { points: (open[1] as any).maxPoints },
      [open[2].id]: { points: 1 },
    };
    expect(reviewTargets(exam, answers, grades)).toEqual([
      mc[1].id,
      mc[4].id,
      open[2].id,
      open[3].id,
      open[4].id,
    ]);
  });
});
