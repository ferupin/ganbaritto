import type { CreatorFields } from "./prompt";

/**
 * Regras dos campos do formulário "Criar com IA". Núcleo puro: devolve
 * códigos de erro, e a tela escolhe o texto (assim o dicionário fica fora daqui).
 */
export type FieldCode = "required" | "range";

export interface NumberRule {
  min: number;
  max: number;
  /** Máximo de dígitos aceitos na digitação. */
  digits: number;
}

export const limits = {
  age: { min: 3, max: 25, digits: 2 },
  objectiveCount: { min: 1, max: 100, digits: 3 },
  openCount: { min: 0, max: 20, digits: 2 },
  partsCount: { min: 1, max: 12, digits: 2 },
} as const satisfies Record<string, NumberRule>;

export const maxLength = {
  grade: 40,
  institution: 80,
  city: 60,
  curriculum: 40,
  studentNotes: 400,
  subject: 60,
  title: 90,
  topics: 1500,
  materials: 1500,
  extraStyle: 600,
} as const;

/** Mantém só dígitos e corta no tamanho máximo. */
export function sanitizeDigits(value: string, digits: number): string {
  return value.replace(/\D/g, "").slice(0, digits);
}

export type CreatorErrors = Partial<Record<keyof CreatorFields, FieldCode>>;

function checkNumber(
  value: string,
  rule: NumberRule,
  optional: boolean,
): FieldCode | undefined {
  if (value.trim() === "") return optional ? undefined : "required";
  const n = Number(value);
  return Number.isInteger(n) && n >= rule.min && n <= rule.max
    ? undefined
    : "range";
}

export function validateCreator(f: CreatorFields): CreatorErrors {
  const e: CreatorErrors = {};
  if (!f.grade.trim()) e.grade = "required";
  if (!f.subject.trim()) e.subject = "required";
  const age = checkNumber(f.age, limits.age, true);
  if (age) e.age = age;
  const obj = checkNumber(f.objectiveCount, limits.objectiveCount, true);
  if (obj) e.objectiveCount = obj;
  const open = checkNumber(f.openCount, limits.openCount, true);
  if (open) e.openCount = open;
  const parts = checkNumber(f.partsCount, limits.partsCount, true);
  if (parts) e.partsCount = parts;
  return e;
}
