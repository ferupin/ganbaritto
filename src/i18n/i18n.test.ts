import { describe, expect, it } from "vitest";
import { allKeys, t, type MessageKey } from "./index";

describe("i18n", () => {
  it("troca placeholders", () => {
    expect(t("runner.progress", { answered: 3, total: 9 })).toBe(
      "3 de 9 questões respondidas",
    );
  });
  it("chave desconhecida devolve a própria chave", () => {
    expect(t("nada.aqui" as MessageKey)).toBe("nada.aqui");
  });
  it("placeholder sem valor é mantido (falha visível)", () => {
    expect(t("brand.home")).toBe("{name}: início");
  });
  it("nenhum texto vazio no dicionário", () => {
    for (const k of allKeys()) expect(t(k as MessageKey).length).toBeGreaterThan(0);
  });
  it("sem travessão no texto da interface", () => {
    for (const k of allKeys()) expect(t(k as MessageKey)).not.toContain("—");
  });
});
