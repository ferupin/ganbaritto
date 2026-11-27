import { describe, expect, it } from "vitest";
import { findBrokenBackslash, hasMath, speakTex, splitMath } from "./math";

describe("splitMath", () => {
  it("texto sem cifrão volta inteiro", () => {
    expect(splitMath("Olá, mundo")).toEqual([{ kind: "text", text: "Olá, mundo" }]);
  });
  it("separa fórmula em linha", () => {
    expect(splitMath("Resolva $2x+5=17$ agora")).toEqual([
      { kind: "text", text: "Resolva " },
      { kind: "math", tex: "2x+5=17", display: false },
      { kind: "text", text: " agora" },
    ]);
  });
  it("separa fórmula em bloco", () => {
    const r = splitMath("$$\\frac{a}{b}$$");
    expect(r).toEqual([{ kind: "math", tex: "\\frac{a}{b}", display: true }]);
  });
  it("preços em reais não viram fórmula", () => {
    for (const s of ["R$ 5,00 e R$ 10,00", "Custa R$5 e R$10", "Pagou R$ 20 por 3 itens"]) {
      expect(hasMath(s)).toBe(false);
    }
  });
  it("cifrão escapado é literal", () => {
    expect(splitMath("\\$5 e \\$6")).toEqual([{ kind: "text", text: "$5 e $6" }]);
  });
  it("cifrão sozinho ou sem fechamento fica como texto", () => {
    expect(hasMath("Isto custa 5$")).toBe(false);
    expect(hasMath("abre $x sem fechar")).toBe(false);
  });
  it("aceita químico com \\ce", () => {
    expect(splitMath("A água é $\\ce{H2O}$.")[1]).toEqual({
      kind: "math",
      tex: "\\ce{H2O}",
      display: false,
    });
  });
  it("duas fórmulas na mesma frase", () => {
    const m = splitMath("$a^2$ e $b^2$").filter((s) => s.kind === "math");
    expect(m).toHaveLength(2);
  });
});

describe("findBrokenBackslash", () => {
  it("acusa \\f e \\t engolidos pelo JSON", () => {
    const parsed = JSON.parse('{"t":"$\\frac{1}{2}$ e $\\times$"}').t as string;
    expect(findBrokenBackslash(parsed)).not.toBeNull();
  });
  it("aceita barra dobrada", () => {
    const parsed = JSON.parse('{"t":"$\\\\frac{1}{2}$"}').t as string;
    expect(findBrokenBackslash(parsed)).toBeNull();
  });
  it("quebra de linha normal é permitida", () => {
    expect(findBrokenBackslash("a\nb")).toBeNull();
  });
});

describe("speakTex", () => {
  it("lê potência, vezes e vírgula decimal", () => {
    expect(speakTex("4{,}5 \\times 10^3")).toBe("4,5 vezes 10 ao cubo");
    expect(speakTex("2^5")).toBe("2 elevado a 5");
    expect(speakTex("(-3)^2")).toBe("(menos 3) ao quadrado");
  });
  it("lê fração, raiz e igualdade", () => {
    expect(speakTex("\\frac{3}{6} = \\frac{1}{2}")).toBe("3 sobre 6 igual a 1 sobre 2");
    expect(speakTex("\\sqrt{49} = 7")).toBe("raiz quadrada de 49 igual a 7");
  });
  it("lê equação com subtração e química", () => {
    expect(speakTex("3x = 20 - 5 = 15")).toBe("3x igual a 20 menos 5 igual a 15");
    expect(speakTex("\\ce{H2O}")).toBe("H 2 O");
  });
});
