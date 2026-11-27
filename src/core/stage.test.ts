import { describe, expect, it } from "vitest";
import { stageOf, yearOf } from "./stage";

describe("etapa de ensino", () => {
  it("lê o ano do texto", () => {
    expect(yearOf("5º Ano do Ensino Fundamental I")).toBe(5);
    expect(yearOf("9º ano")).toBe(9);
    expect(yearOf("Ensino Médio")).toBeUndefined();
    expect(yearOf(undefined)).toBeUndefined();
  });
  it("separa Fundamental I e II", () => {
    expect(stageOf("1º Ano")).toBe("fundamental-1");
    expect(stageOf("5º Ano")).toBe("fundamental-1");
    expect(stageOf("6º Ano")).toBe("fundamental-2");
    expect(stageOf("9º Ano")).toBe("fundamental-2");
  });
  it("fora de 1 a 9 vai para other", () => {
    expect(stageOf("1ª série do Ensino Médio")).toBe("other");
    expect(stageOf("")).toBe("other");
  });
});
