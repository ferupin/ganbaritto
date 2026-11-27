// Lista a licença de cada dependência de produção (e suas dependências).
// Uso: node scripts/licenses.mjs        -> imprime a tabela
//      node scripts/licenses.mjs --md   -> formato do THIRD_PARTY_NOTICES.md
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const seen = new Map();

function find(name, from) {
  let dir = from;
  while (true) {
    const p = join(dir, "node_modules", name, "package.json");
    if (existsSync(p)) return p;
    const up = join(dir, "..");
    if (up === dir || !dir.startsWith(root)) break;
    dir = up;
  }
  const p = join(root, "node_modules", name, "package.json");
  return existsSync(p) ? p : null;
}

function walk(name, from) {
  const file = find(name, from);
  if (!file || seen.has(name)) return;
  const j = JSON.parse(readFileSync(file, "utf8"));
  const lic = typeof j.license === "string" ? j.license : j.license?.type ?? "VER ARQUIVO";
  seen.set(name, { version: j.version, license: lic });
  const dir = join(file, "..");
  for (const dep of Object.keys(j.dependencies ?? {})) walk(dep, dir);
}

for (const dep of Object.keys(pkg.dependencies ?? {})) walk(dep, root);

const rows = [...seen.entries()].sort(([a], [b]) => a.localeCompare(b));
if (process.argv.includes("--md")) {
  console.log("| Pacote | Versão | Licença |\n|---|---|---|");
  for (const [n, v] of rows) console.log(`| ${n} | ${v.version} | ${v.license} |`);
} else {
  for (const [n, v] of rows) console.log(`${n}@${v.version}\t${v.license}`);
}
