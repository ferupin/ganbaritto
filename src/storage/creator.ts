import {
  CreatorSchema,
  defaultFields,
  type CreatorFields,
} from "@/core/prompt";
import { P, readRaw, removeRaw, writeRaw } from "./local";

const KEY = `${P}.creator`;

/** Campos do formulário "Criar com IA". Sempre devolve um objeto válido. */
export function loadCreator(): CreatorFields {
  const r = CreatorSchema.safeParse(readRaw(KEY) ?? {});
  return r.success ? r.data : defaultFields;
}

export function saveCreator(fields: CreatorFields): boolean {
  return writeRaw(KEY, fields);
}

export function clearCreator(): void {
  removeRaw(KEY);
}
