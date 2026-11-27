"use client";

import { Check, X } from "lucide-react";
import { RichText } from "@/components/math/RichText";
import { memo } from "react";
import type { McQuestion } from "@/core/schema";
import { t } from "@/i18n";
import { QuestionHead } from "./QuestionHead";
import { QuestionTable } from "./QuestionTable";
import { storeFor, useRunner } from "./store";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/**
 * Questão de múltipla escolha. Lê só a própria resposta do store, então
 * marcar uma alternativa redesenha apenas este cartão e não a prova inteira.
 */
export const McCard = memo(function McCard({
  q,
  number,
  examId,
}: {
  q: McQuestion;
  number: number;
  examId: string;
}) {
  const answer = useRunner(examId, (s) => s.attempt.answers[q.id]);
  const locked = useRunner(examId, (s) => s.attempt.finished);
  const setAnswer = storeFor(examId).getState().setAnswer;

  return (
    <section className="question" data-qid={q.id} tabIndex={-1} aria-labelledby={`q-${q.id}`}>
      <QuestionHead number={number} title={q.title} kind="auto" />
      {q.context && (
        <p className="my-1.5 mb-2.5 rounded border-l-[3px] border-line-strong bg-paper-2 px-3.5 py-2.5 text-base">
          <RichText text={q.context} />
        </p>
      )}
      {q.table && <QuestionTable table={q.table} />}
      <p className="mb-3 mt-2 font-semibold" id={`q-${q.id}`}>
        <RichText text={q.prompt} />
      </p>
      {q.statements && (
        <div className="mb-3 ml-1 mt-1.5 grid gap-1">
          {q.statements.map((s, i) => (
            <div key={i} className="flex gap-2">
              <span className="min-w-7 font-bold">{ROMAN[i] ?? i + 1}.</span>
              <span><RichText text={s} /></span>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-2" role="radiogroup" aria-labelledby={`q-${q.id}`}>
        {q.options.map((o) => {
          const selected = answer === o.id;
          const isCorrect = locked && o.id === q.answer;
          const isWrong = locked && selected && o.id !== q.answer;
          const cls = [
            "option",
            selected && "option-selected",
            locked && "option-locked",
            isCorrect && "option-correct",
            isWrong && "option-wrong",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <label key={o.id} className={cls}>
              <input
                type="radio"
                name={q.id}
                value={o.id}
                checked={selected}
                disabled={locked}
                onChange={() => setAnswer(q.id, o.id)}
              />
              <span className="option-letter" aria-hidden="true">
                {o.id.toUpperCase()}
              </span>
              <span className="min-w-0 flex-1"><RichText text={o.text} /></span>
              {isCorrect && (
                <span className="ml-auto inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-bold">
                  <Check size={15} aria-hidden="true" />
                  <span className="max-sm:sr-only">{t("question.correct")}</span>
                </span>
              )}
              {isWrong && (
                <span className="ml-auto inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-bold">
                  <X size={15} aria-hidden="true" />
                  <span className="max-sm:sr-only">{t("question.yourAnswer")}</span>
                </span>
              )}
            </label>
          );
        })}
      </div>
      {locked && (
        <div className="mt-3 rounded-lg border-l-4 border-accent bg-accent-soft px-3.5 py-3 text-[15px] print:hidden">
          <strong className="mb-0.5 block">
            {!answer
              ? t("question.noAnswerExplain")
              : answer === q.answer
                ? t("question.rightExplain")
                : t("question.explain")}
          </strong>
          <RichText text={q.explanation} />
        </div>
      )}
    </section>
  );
});
