import { describe, expect, it } from "vitest";
import { parseExamJson, validateExam } from "./schema";
import { templateExam, templateJson } from "./template";
import historia from "./fixtures/exam-35q-com-discursivas.json";

describe("schema", () => {
  it("valida o banco de fixture", () => {
    expect(validateExam(historia).ok).toBe(true);
  });

  it("conta as questões do protótipo: 30 objetivas + 5 discursivas", () => {
    const r = validateExam(historia);
    if (!r.ok) throw new Error("inválido");
    const qs = r.exam.parts.flatMap((p) => p.questions);
    expect(qs).toHaveLength(35);
    expect(qs.filter((q) => q.type === "open")).toHaveLength(5);
    expect(r.exam.parts).toHaveLength(5);
  });

  it("valida o template entregue à LLM", () => {
    expect(validateExam(templateExam).ok).toBe(true);
  });

  it("aceita JSON com cerca de código (```json)", () => {
    expect(parseExamJson("```json\n" + templateJson + "\n```").ok).toBe(true);
  });

  it("rejeita JSON quebrado com mensagem em português", () => {
    const r = parseExamJson("{ isso não é json");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toMatch(/JSON válido/);
  });

  it("rejeita resposta que não existe nas alternativas", () => {
    const bad = structuredClone(templateExam) as any;
    bad.parts[0].questions[0].answer = "z";
    const r = validateExam(bad);
    expect(r.ok).toBe(false);
    if (!r.ok)
      expect(r.errors.join(" ")).toMatch(/Parte 1 › Questão 1 › answer/);
  });

  it("rejeita ids de questão repetidos e tipo desconhecido", () => {
    const dup = structuredClone(templateExam) as any;
    dup.parts[0].questions[1].id = "q01";
    expect(validateExam(dup).ok).toBe(false);
    const t = structuredClone(templateExam) as any;
    t.parts[0].questions[0].type = "vf";
    const r = validateExam(t);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(" ")).toMatch(/tipo de questão inválido/);
  });

  it("avisa quando não há 4 alternativas", () => {
    const t = structuredClone(templateExam) as any;
    t.parts[0].questions[0].options.pop();
    const r = validateExam(t);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.warnings).toHaveLength(1);
  });

  it("rejeita fórmula com barra invertida não dobrada (\\f virou caractere de controle)", () => {
    const bad = structuredClone(templateExam) as any;
    bad.parts[0].questions[0].prompt = JSON.parse('{"p":"Calcule $\\frac{1}{2}$"}').p;
    const r = validateExam(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toMatch(/barra invertida/);
    const good = structuredClone(templateExam) as any;
    good.parts[0].questions[0].prompt = JSON.parse('{"p":"Calcule $\\\\frac{1}{2}$"}').p;
    expect(validateExam(good).ok).toBe(true);
  });
});
