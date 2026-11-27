import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import pkg from "../../package.json";
import { entries } from "./entries";

const semver = /^\d+\.\d+\.\d+$/;
const cmp = (a: string, b: string) => {
  const [x, y] = [a, b].map((v) => v.split(".").map(Number));
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};

describe("changelog", () => {
  it("a versão mais nova é a do package.json", () => {
    expect(entries[0].version).toBe(pkg.version);
  });
  it("versões são X.Y.Z, únicas e em ordem decrescente", () => {
    for (const e of entries) expect(e.version).toMatch(semver);
    for (let i = 1; i < entries.length; i++)
      expect(cmp(entries[i - 1].version, entries[i].version)).toBeGreaterThan(0);
  });
  it("datas válidas e não decrescentes ao subir de versão", () => {
    for (const e of entries) expect(Number.isNaN(Date.parse(e.date))).toBe(false);
    for (let i = 1; i < entries.length; i++)
      expect(entries[i - 1].date >= entries[i].date).toBe(true);
  });
  it("toda entrada tem resumo e ao menos uma mudança, sem textos vazios", () => {
    for (const e of entries) {
      expect(e.summary.trim()).not.toBe("");
      const items = Object.values(e.changes).flat();
      expect(items.length).toBeGreaterThan(0);
      for (const i of items) expect(i.trim()).not.toBe("");
    }
  });
  it("docs/CHANGELOG.md tem uma seção por versão", () => {
    const md = fs.readFileSync(path.resolve(__dirname, "../../docs/CHANGELOG.md"), "utf8");
    for (const e of entries) expect(md).toContain(`## ${e.version}`);
  });
});
