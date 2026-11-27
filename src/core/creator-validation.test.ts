import { describe, expect, it } from "vitest";
import { defaultFields } from "./prompt";
import { sanitizeDigits, validateCreator } from "./creator-validation";

describe("validação do formulário", () => {
  it("série e disciplina são obrigatórias", () => {
    expect(validateCreator(defaultFields)).toEqual({
      grade: "required",
      subject: "required",
    });
  });
  it("campos opcionais vazios são aceitos", () => {
    const f = { ...defaultFields, grade: "5º Ano", subject: "História" };
    expect(validateCreator(f)).toEqual({});
  });
  it("idade e quantidades fora da faixa são apontadas", () => {
    const f = { ...defaultFields, grade: "a", subject: "b", age: "2", objectiveCount: "500", partsCount: "0" };
    expect(validateCreator(f)).toEqual({ age: "range", objectiveCount: "range", partsCount: "range" });
  });
  it("sanitizeDigits remove letras e corta o tamanho", () => {
    expect(sanitizeDigits("1a2b3c4", 3)).toBe("123");
    expect(sanitizeDigits("-5", 2)).toBe("5");
  });
});
