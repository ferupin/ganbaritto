/**
 * Identidade em UM só lugar. Trocar o nome do produto é editar este arquivo
 * (e, se mudar o desenho, rodar scripts/gerar-logo.py). Nenhum outro arquivo
 * escreve o nome à mão: o teste src/brand/identity.test.ts garante isso.
 *
 * O nome ainda é provisório: não foi validado juridicamente (INPI, WIPO, domínios).
 */
export const brand = {
  name: "Ganbaritto",
  /** Forma sem acento e sem espaço, para nomes de arquivo. */
  slug: "ganbaritto",
  tagline: "Seu banco de questões num arquivo só.",
  /** Prefixo das chaves do localStorage. Mudar o nome da marca NÃO deve mudar isto:
   *  mudar apaga o acesso aos dados já salvos no navegador. */
  storagePrefix: "examgen.v1",
} as const;
