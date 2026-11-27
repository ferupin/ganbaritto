"use client";

import { Check, ChevronDown, ListChecks } from "lucide-react";
import { useMemo } from "react";
import { RichText } from "@/components/math/RichText";
import type { Exam, Question } from "@/core/schema";
import { summarizeExam } from "@/core/preview";
import { t } from "@/i18n";
import { QuestionTable } from "@/features/runner/QuestionTable";

/**
 * Antes de salvar: números do banco e as questões com o gabarito já marcado.
 * Só leitura, sem tocar em tentativa nem em armazenamento.
 */
export function ExamPreview({ exam }: { exam: Exam }) {
  const s = useMemo(() => summarizeExam(exam), [exam]);
  const letters = Object.entries(s.answerLetters).sort(([a], [b]) => a.localeCompare(b));
  let n = 0;

  return (
    <div className="mt-3 grid gap-3" data-testid="exam-preview">
      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <Stat label={t("preview.statTotal")} value={s.total} />
        <Stat label={t("preview.statObjective")} value={s.objective} />
        <Stat label={t("preview.statOpen")} value={s.open} />
        <Stat label={t("preview.statMath")} value={s.withMath} />
      </dl>

      {letters.length > 0 && (
        <div className="text-sm" data-testid="preview-letters">
          <strong>{t("preview.letters")}</strong>{" "}
          {letters.map(([l, c]) => (
            <span key={l} className="mr-2.5 inline-block whitespace-nowrap">
              <span className="font-bold">{l.toUpperCase()}</span> {c}
            </span>
          ))}
          <span className="block text-muted">{t("preview.lettersHint")}</span>
        </div>
      )}

      <details className="disclosure">
        <summary>
          <span className="grid size-9 flex-none place-items-center rounded-xl bg-accent-soft text-accent-text">
            <ListChecks size={18} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 font-bold">{t("preview.open", { total: s.total })}</span>
          <ChevronDown size={20} aria-hidden="true" className="chevron flex-none text-muted transition-transform" />
        </summary>
        <div className="fade-in grid gap-4 rounded-b-2xl border border-t-0 border-line bg-paper-2/40 p-3 sm:p-4">
          {exam.parts.map((p) => (
            <section key={p.id} aria-label={p.title}>
              <h3 className="part-title !mt-0">{p.title}</h3>
              <div className="grid gap-3">
                {p.questions.map((q) => (
                  <PreviewQuestion key={q.id} q={q} number={++n} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </details>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-paper px-3 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-lg font-extrabold">{value}</dd>
    </div>
  );
}

function PreviewQuestion({ q, number }: { q: Question; number: number }) {
  return (
    <div className="question !mb-0" data-testid="preview-question">
      <div className="mb-1.5 flex items-baseline gap-2.5">
        <span className="min-w-7 font-extrabold text-accent-text">{number}.</span>
        {q.title && <span className="font-bold">{q.title}</span>}
        <span className={`badge ml-auto ${q.type === "open" ? "badge-warm" : ""}`}>
          {t(q.type === "open" ? "runner.assistedBadge" : "runner.autoBadge")}
        </span>
      </div>
      {q.context && (
        <p className="mb-2 rounded border-l-[3px] border-line-strong bg-paper-2 px-3 py-2">
          <RichText text={q.context} />
        </p>
      )}
      {q.table && <QuestionTable table={q.table} />}
      <p className="mb-2 font-semibold">
        <RichText text={q.prompt} />
      </p>
      {q.type === "multiple_choice" ? (
        <>
          {q.statements && (
            <ul className="mb-2 ml-1 grid gap-1">
              {q.statements.map((s, i) => (
                <li key={i}>
                  <RichText text={s} />
                </li>
              ))}
            </ul>
          )}
          <ul className="grid gap-1.5">
            {q.options.map((o) => {
              const right = o.id === q.answer;
              return (
                <li
                  key={o.id}
                  data-correct={right}
                  className={`flex items-start gap-2.5 rounded-lg border px-3 py-1.5 ${
                    right ? "border-ok-line bg-ok-soft text-ok" : "border-line"
                  }`}
                >
                  <span className="font-bold">{o.id.toUpperCase()}</span>
                  <span className="min-w-0 flex-1">
                    <RichText text={o.text} />
                  </span>
                  {right && (
                    <span className="inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-bold">
                      <Check size={14} aria-hidden="true" />
                      {t("preview.answerMark")}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 rounded border-l-[3px] border-accent bg-accent-soft px-3 py-2 text-sm">
            <strong>{t("question.explain")}</strong> <RichText text={q.explanation} />
          </p>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-line-strong bg-paper-2 px-3 py-2 text-sm">
          <strong>{t("question.expected")}</strong> <RichText text={q.expectedAnswer} />
          <ul className="mt-1 list-disc pl-5">
            {q.criteria.map((c, i) => (
              <li key={i}>
                <RichText text={c} />
              </li>
            ))}
          </ul>
          <span className="text-muted">{t("preview.maxPoints", { max: q.maxPoints })}</span>
        </div>
      )}
    </div>
  );
}
