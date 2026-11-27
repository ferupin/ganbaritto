import { describe, expect, it } from "vitest";
import { validateExam } from "./schema";
import { summarizeExam } from "./preview";
import historia from "./fixtures/exam-35q-com-discursivas.json";
import matematica from "@/exams/catalog/matematica-8ano.json";

function exam(raw: unknown) {
  const r = validateExam(raw);
  if (!r.ok) throw new Error("inválido");
  return r.exam;
}

describe("summarizeExam", () => {
  it("conta tipos, partes e pontos das discursivas (fixture de 35 questões)", () => {
    const s = summarizeExam(exam(historia));
    expect(s.total).toBe(35);
    expect(s.objective).toBe(30);
    expect(s.open).toBe(5);
    expect(s.parts).toHaveLength(5);
    expect(s.parts.reduce((n, p) => n + p.count, 0)).toBe(35);
    expect(Object.values(s.answerLetters).reduce((a, b) => a + b, 0)).toBe(30);
    expect(s.openMaxPoints).toBe(15);
  });
  it("detecta questões com fórmula e tabela (Matemática do catálogo)", () => {
    const s = summarizeExam(exam(matematica));
    expect(s.withMath).toBeGreaterThanOrEqual(8);
    expect(s.withTable).toBe(1);
  });
});
