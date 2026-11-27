/**
 * Separa um texto em pedaços de texto comum e de fórmula (LaTeX entre $ ... $
 * ou $$ ... $$). Puro: sem React, sem KaTeX.
 *
 * Regras (as mesmas do Pandoc), para não confundir com preços como "R$ 5,00":
 * - o "$" de abertura precisa ter um caractere que não é espaço logo depois;
 * - o "$" de fechamento precisa ter um caractere que não é espaço logo antes
 *   e não pode ser seguido de dígito;
 * - "$" colado em "R" ("R$") nunca abre fórmula;
 * - "\$" é um cifrão literal.
 */
export type MathSegment =
  | { kind: "text"; text: string }
  | { kind: "math"; tex: string; display: boolean };

const isSpace = (c: string | undefined) => c === undefined || /\s/.test(c);
const isDigit = (c: string | undefined) => c !== undefined && /[0-9]/.test(c);

export function hasMath(text: string): boolean {
  return text.includes("$") && splitMath(text).some((s) => s.kind === "math");
}

export function splitMath(text: string): MathSegment[] {
  const out: MathSegment[] = [];
  let buf = "";
  const flush = () => {
    if (buf) out.push({ kind: "text", text: buf });
    buf = "";
  };
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === "\\" && text[i + 1] === "$") {
      buf += "$";
      i += 2;
      continue;
    }
    if (c !== "$") {
      buf += c;
      i++;
      continue;
    }
    const display = text[i + 1] === "$";
    const open = i + (display ? 2 : 1);
    const delim = display ? "$$" : "$";
    const afterR = text[i - 1] === "R";
    let end = -1;
    if (!afterR && !isSpace(text[open])) {
      for (let j = open; j < text.length; j++) {
        if (text[j] === "\\") {
          j++;
          continue;
        }
        if (text.startsWith(delim, j) && !isSpace(text[j - 1])) {
          if (!display && isDigit(text[j + 1])) continue;
          end = j;
          break;
        }
        if (!display && text[j] === "\n") break;
      }
    }
    if (end === -1) {
      buf += c;
      i++;
      continue;
    }
    flush();
    out.push({ kind: "math", tex: text.slice(open, end), display });
    i = end + delim.length;
  }
  flush();
  return out;
}

/**
 * Barra invertida de LaTeX dentro de JSON precisa ser dobrada ("\\frac").
 * Quando a IA esquece, "\f", "\t", "\b" e "\r" viram caracteres de controle
 * e a fórmula quebra em silêncio. Devolve o primeiro trecho suspeito.
 */
export function findBrokenBackslash(text: string): string | null {
  const m = /[\u0008\u000c\u000b\t\r]/.exec(text);
  if (!m) return null;
  const from = Math.max(0, m.index - 12);
  return text.slice(from, m.index + 12).replace(/[\u0008\u000c\u000b\t\r]/g, "▯");
}

const SPOKEN: Record<string, string> = {
  "\\times": " vezes ",
  "\\cdot": " vezes ",
  "\\div": " dividido por ",
  "\\pm": " mais ou menos ",
  "\\le": " menor ou igual a ",
  "\\leq": " menor ou igual a ",
  "\\ge": " maior ou igual a ",
  "\\geq": " maior ou igual a ",
  "\\ne": " diferente de ",
  "\\neq": " diferente de ",
  "\\approx": " aproximadamente ",
  "\\pi": " pi ",
  "\\theta": " teta ",
  "\\alpha": " alfa ",
  "\\beta": " beta ",
  "\\Delta": " delta ",
  "\\infty": " infinito ",
  "\\rightarrow": " seta para ",
  "\\to": " seta para ",
  "\\%": " por cento ",
  "\\,": " ",
  "\\ ": " ",
};

/**
 * Leitura aproximada, em português, de uma fórmula. Serve de nome acessível
 * (aria-label) para leitores de tela. Cobre o básico; o que não conhece fica
 * como está, sem inventar.
 */
export function speakTex(tex: string): string {
  let s = tex.replace(/\\ce\{([^}]*)\}/g, (_, c: string) => c.replace(/(\d+)/g, " $1 ").replace(/\s+/g, " "));
  s = s.replace(/\\(?:mathrm|text|mathbf)\{([^}]*)\}/g, "$1");
  for (let i = 0; i < 4; i++) {
    s = s
      .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, " $1 sobre $2 ")
      .replace(/\\sqrt\[(\d+)\]\{([^{}]*)\}/g, " raiz de índice $1 de $2 ")
      .replace(/\\sqrt\{([^{}]*)\}/g, " raiz quadrada de $1 ");
  }
  s = s
    .replace(/\^\{?2\}?/g, " ao quadrado ")
    .replace(/\^\{?3\}?/g, " ao cubo ")
    .replace(/\^\{([^{}]*)\}/g, " elevado a $1 ")
    .replace(/\^(\w)/g, " elevado a $1 ")
    .replace(/_\{([^{}]*)\}/g, " índice $1 ")
    .replace(/_(\w)/g, " índice $1 ");
  s = s.replace(/\\[A-Za-z]+|\\[,% ]/g, (m) => SPOKEN[m] ?? m);
  s = s
    .replace(/\{,\}/g, ",")
    .replace(/=/g, " igual a ")
    .replace(/\+/g, " mais ")
    .replace(/(^|[\s(])-(?=\s*[\d(a-zA-Z])/g, "$1 menos ")
    .replace(/(?<=[\w)}])\s*-\s*(?=[\w({])/g, " menos ")
    .replace(/[{}]/g, "");
  return s.replace(/\s+/g, " ").replace(/\(\s/g, "(").trim();
}
