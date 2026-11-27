import { describe, expect, it } from "vitest";
import { answerKey, answerLines } from "./print";

describe("impressão", () => {
  it("linhas de escrita crescem com a pontuação, com piso e teto", () => {
    expect(answerLines(1)).toBe(6);
    expect(answerLines(3)).toBe(10);
    expect(answerLines(20)).toBe(14);
  });
  it("gabarito usa o número da questão na prova inteira, pulando discursivas", () => {
    const qs = [
      { id: "a", type: "multiple_choice", options: [{ id: "a" }, { id: "b" }], answer: "b" },
      { id: "b", type: "open" },
      { id: "c", type: "multiple_choice", options: [{ id: "a" }, { id: "b" }, { id: "c" }], answer: "c" },
    ];
    expect(answerKey(qs)).toEqual([
      { number: 1, letter: "B" },
      { number: 3, letter: "C" },
    ]);
  });
});
