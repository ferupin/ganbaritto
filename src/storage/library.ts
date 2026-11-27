import { validateExam, type Exam } from "@/core/schema";
import { P, readRaw, writeRaw } from "./local";

const KEY = `${P}.library`;

/** Bancos importados pelo usuário. Itens inválidos são descartados na leitura. */
export function loadLibrary(): Exam[] {
  const raw = readRaw(KEY);
  const exams: Exam[] = [];
  for (const item of Array.isArray(raw) ? raw : []) {
    const r = validateExam(item);
    if (r.ok) exams.push(r.exam);
  }
  return exams;
}

/** Adiciona ou substitui (mesmo id) um banco na biblioteca. */
export function saveToLibrary(exam: Exam): boolean {
  const lib = loadLibrary().filter((e) => e.id !== exam.id);
  lib.push(exam);
  return writeRaw(KEY, lib);
}

export function removeFromLibrary(examId: string): boolean {
  return writeRaw(
    KEY,
    loadLibrary().filter((e) => e.id !== examId),
  );
}
