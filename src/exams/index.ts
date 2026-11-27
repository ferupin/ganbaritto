import { stageOf, yearOf, type Stage } from "@/core/stage";
import { validateExam, type Exam } from "@/core/schema";
import artes2 from "./catalog/arte-2ano.json";
import ciencias4 from "./catalog/ciencias-4ano.json";
import educacaoFisica1 from "./catalog/educacao-fisica-1ano.json";
import ensinoReligioso9 from "./catalog/ensino-religioso-9ano.json";
import geografia6 from "./catalog/geografia-6ano.json";
import historia5 from "./catalog/historia-5ano.json";
import ingles7 from "./catalog/ingles-7ano.json";
import portugues3 from "./catalog/lingua-portuguesa-3ano.json";
import matematica8 from "./catalog/matematica-8ano.json";

/**
 * Registro dos bancos de exemplo que acompanham o app: um banco genérico de
 * 10 questões por matéria, do 1º ao 9º ano (nada de material de escola ou livro).
 * Adicionar um banco = um arquivo JSON + uma linha aqui. A etapa vem do
 * campo `grade`. Todos são validados na carga e o teste exams.test.ts
 * falha se algum ficar inválido.
 */
const catalogRaw: unknown[] = [
  educacaoFisica1,
  artes2,
  portugues3,
  ciencias4,
  historia5,
  geografia6,
  ingles7,
  matematica8,
  ensinoReligioso9,
];

function load(raws: unknown[]): Exam[] {
  return raws.flatMap((raw) => {
    const r = validateExam(raw);
    return r.ok ? [r.exam] : [];
  });
}

const byYear = (a: Exam, b: Exam) =>
  (yearOf(a.grade) ?? 99) - (yearOf(b.grade) ?? 99) ||
  a.subject.localeCompare(b.subject, "pt-BR");

export const catalogExams: Exam[] = load(catalogRaw).sort(byYear);
export const exampleExams: Exam[] = catalogExams;

export function findExample(id: string): Exam | undefined {
  return exampleExams.find((e) => e.id === id);
}

/** Catálogo agrupado por etapa, na ordem de exibição. Grupos vazios não aparecem. */
export function catalogByStage(): { stage: Stage; exams: Exam[] }[] {
  const order: Stage[] = ["fundamental-1", "fundamental-2", "other"];
  return order
    .map((stage) => ({
      stage,
      exams: catalogExams.filter((e) => stageOf(e.grade) === stage),
    }))
    .filter((g) => g.exams.length > 0);
}
