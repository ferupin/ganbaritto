import { pt, type Messages } from "./pt";

type Paths<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : Paths<T[K], `${P}${K}.`>;
}[keyof T & string];

/** Chaves válidas como "runner.finish". Uma chave errada falha o typecheck. */
export type MessageKey = Paths<Messages>;

const messages: Messages = pt;

/**
 * Busca um texto pelo caminho pontuado e troca {placeholders}.
 * Se a chave não existir devolve a própria chave: a falha fica visível
 * em vez de quebrar a tela.
 */
export function t(
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let node: unknown = messages;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && Object.hasOwn(node, part)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  if (typeof node !== "string") return key;
  return vars
    ? node.replace(/\{(\w+)\}/g, (m, k: string) =>
        Object.hasOwn(vars, k) ? String(vars[k]) : m,
      )
    : node;
}

/** Lista todas as chaves de texto (usado pelo teste do dicionário). */
export function allKeys(obj: unknown = messages, prefix = ""): string[] {
  if (typeof obj === "string") return [prefix];
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).flatMap(([k, v]) =>
    allKeys(v, prefix ? `${prefix}.${k}` : k),
  );
}
