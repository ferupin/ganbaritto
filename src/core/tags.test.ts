import { describe, expect, it } from "vitest";
import { addTags, joinTags, parseTags, removeTag } from "./tags";

const L = { max: 4, maxLength: 12 };

describe("tags", () => {
  it("vai e volta pelo texto com uma por linha", () => {
    expect(parseTags("a\n\n b \n")).toEqual(["a", "b"]);
    expect(joinTags(["a", "b"])).toBe("a\nb");
  });
  it("separa por vírgula, ponto e vírgula e quebra de linha", () => {
    expect(addTags([], "Frações, Decimais; Área\nMedidas", L).tags).toEqual(["Frações", "Decimais", "Área", "Medidas"]);
  });
  it("ignora vazios e repetidos sem diferenciar maiúsculas", () => {
    const r = addTags(["Frações"], " ,frações, FRAÇÕES ,Área", L);
    expect(r.tags).toEqual(["Frações", "Área"]);
    expect(r.added).toBe(1);
  });
  it("respeita o máximo de itens e o tamanho", () => {
    const r = addTags(["a", "b", "c"], "d, e, f", L);
    expect(r.tags).toHaveLength(4);
    expect(addTags([], "uma etiqueta muito comprida", L).tags[0]).toHaveLength(12);
  });
  it("remove só a etiqueta pedida", () => {
    expect(removeTag(["a", "b"], "a")).toEqual(["b"]);
  });
});
