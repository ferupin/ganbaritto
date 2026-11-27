/**
 * Lista de etiquetas ("tags") guardada como texto com uma por linha, que é
 * o formato que o pedido para a IA já usa. Funções puras, sem React.
 */
export interface TagLimits {
  max: number;
  maxLength: number;
}

export function parseTags(text: string): string[] {
  return text
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function joinTags(tags: string[]): string {
  return tags.join("\n");
}

/**
 * Acrescenta o que foi digitado ou colado. Vírgula, ponto e vírgula e quebra
 * de linha separam itens. Ignora vazios e repetidos (sem diferenciar
 * maiúsculas) e respeita os limites. `added` diz quantas entraram de fato.
 */
export function addTags(
  current: string[],
  raw: string,
  limits: TagLimits,
): { tags: string[]; added: number } {
  const seen = new Set(current.map((t) => t.toLocaleLowerCase("pt-BR")));
  const tags = [...current];
  let added = 0;
  for (const piece of raw.split(/[\n,;]+/)) {
    const tag = piece.trim().replace(/\s+/g, " ").slice(0, limits.maxLength).trim();
    if (!tag || tags.length >= limits.max) continue;
    const key = tag.toLocaleLowerCase("pt-BR");
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
    added++;
  }
  return { tags, added };
}

export function removeTag(current: string[], tag: string): string[] {
  return current.filter((t) => t !== tag);
}
