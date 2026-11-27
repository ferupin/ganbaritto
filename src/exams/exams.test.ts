import { describe, expect, it } from "vitest";
import { validateExam } from "@/core/schema";
import { computeResult } from "@/core/score";
import { catalogByStage, catalogExams, exampleExams, findExample } from "./index";
import { yearOf } from "@/core/stage";
import { allQuestions } from "@/core/score";

describe("catálogo de exemplos", () => {
  it("tem um banco por matéria padrão, todos carregados", () => {
    expect(catalogExams).toHaveLength(9);
    expect(exampleExams).toHaveLength(9);
    const subjects = catalogExams.map((e) => e.subject);
    expect(new Set(subjects).size).toBe(9);
    for (const s of ["Língua Portuguesa", "Matemática", "Ciências", "História", "Geografia", "Arte", "Educação Física", "Língua Inglesa", "Ensino Religioso"])
      expect(subjects).toContain(s);
  });
  it("cobre cada ano do 1º ao 9º", () => {
    expect(catalogExams.map((e) => yearOf(e.grade))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it("cada banco tem exatamente 10 questões", () => {
    for (const e of catalogExams) expect(allQuestions(e), e.id).toHaveLength(10);
  });
  it("ids únicos e achados pelo registro", () => {
    const ids = exampleExams.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(findExample(id)?.id).toBe(id);
  });
  it("objetivas têm 4 alternativas e o gabarito é equilibrado", () => {
    for (const e of catalogExams) {
      const mcs = allQuestions(e).filter((q) => q.type === "multiple_choice");
      const count: Record<string, number> = {};
      for (const q of mcs) {
        expect(q.options, `${e.id} ${q.id}`).toHaveLength(4);
        count[q.answer] = (count[q.answer] ?? 0) + 1;
      }
      expect(Math.max(...Object.values(count)), e.id).toBeLessThanOrEqual(3);
    }
  });
  it("não geram avisos de qualidade na importação", () => {
    for (const e of catalogExams) {
      const r = validateExam(e);
      expect(r.ok && r.warnings, e.id).toEqual([]);
    }
  });
  it("agrupa em Fundamental I (5 bancos) e II (4 bancos)", () => {
    const g = catalogByStage();
    expect(g.map((x) => [x.stage, x.exams.length])).toEqual([["fundamental-1", 5], ["fundamental-2", 4]]);
  });
  it("há questões discursivas para demonstrar a correção assistida", () => {
    const open = catalogExams.flatMap((e) => allQuestions(e)).filter((q) => q.type === "open");
    expect(open.length).toBeGreaterThanOrEqual(3);
  });
});
