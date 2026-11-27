import pkg from "../package.json";

import { brand } from "@/brand/identity";

/** Identidade (nome, slug, prefixo de armazenamento): src/brand/identity.ts. */
export { brand };

/** Versão do formato JSON dos bancos de questões. Promessa estável: ver docs/file-format.md. */
export const schemaVersion = 1 as const;

/** Versão do app (vem do package.json; é a mesma mostrada em /versoes). */
export const appVersion: string = pkg.version;

/** Único lugar com URLs externas. Renomear o repositório é uma linha. */
export const links = {
  repo: "https://github.com/ferupin/ganbaritto",
  issues: "https://github.com/ferupin/ganbaritto/issues/new/choose",
} as const;

/** IAs sugeridas na tela "Criar com IA". A ordem é a da exibição; `recommended` destaca uma. */
export const llms = [
  { id: "gemini", name: "Gemini", url: "https://gemini.google.com/app", recommended: true },
  { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com/", recommended: false },
  { id: "claude", name: "Claude", url: "https://claude.ai/new", recommended: false },
] as const;
