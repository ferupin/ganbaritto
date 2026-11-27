import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { brand } from "./identity";

/**
 * Guarda da troca de nome: o nome do produto só pode ser escrito em
 * src/brand/identity.ts. O resto do código lê `brand.name`. Exceções
 * deliberadas: o prefixo do localStorage e o identificador do backup mantêm
 * "examgen" para nunca apagar dados nem invalidar arquivos já exportados.
 */
const SRC = path.resolve(__dirname, "..");
const ALLOW_LEGACY = new Set([
  path.join("brand", "identity.ts"),
  path.join("storage", "backup.ts"),
  path.join("storage", "backup.test.ts"),
  path.join("config.ts"), // links do repositório
  path.join("brand", "identity.test.ts"),
  path.join("changelog", "entries.ts"), // histórico: descreve o que cada versão fez, com os nomes da época
]);

function walk(dir: string, out: string[] = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

describe("identidade", () => {
  const files = walk(SRC).map((f) => [path.relative(SRC, f), fs.readFileSync(f, "utf8")] as const);

  it("o nome do produto não está escrito à mão fora de src/brand/identity.ts", () => {
    const name = new RegExp(brand.name, "i");
    for (const [rel, text] of files) {
      if (rel === path.join("brand", "identity.ts") || rel === path.join("brand", "identity.test.ts")) continue;
      if (rel.endsWith("logo-paths.ts") || rel === path.join("changelog", "entries.ts") || rel === "config.ts") continue; // config.ts: URLs do repositório
      expect(text, rel).not.toMatch(name);
    }
  });

  it("o nome antigo só aparece onde protege dados já salvos", () => {
    for (const [rel, text] of files) {
      if (ALLOW_LEGACY.has(rel)) continue;
      expect(text, rel).not.toMatch(/examgen/i);
    }
  });

  it("o slug é seguro para nome de arquivo", () => {
    expect(brand.slug).toMatch(/^[a-z0-9-]+$/);
  });
});
