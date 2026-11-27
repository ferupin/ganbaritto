"use client";

import { memo } from "react";
import { RichText } from "@/components/math/RichText";
import type { OpenQuestion } from "@/core/schema";
import { isAnswered } from "@/core/score";
import { t } from "@/i18n";
import { QuestionHead } from "./QuestionHead";
import { QuestionTable } from "./QuestionTable";
import { storeFor, useRunner } from "./store";

const RUBRIC_3 = ["question.rubric0", "question.rubric1", "question.rubric2", "question.rubric3"] as const;

/**
 * Questão discursiva com correção assistida. A nota escolhida pelo
 * responsável é o que decide se a prova já tem nota final.
 */
export const OpenCard = memo(function OpenCard({
  q,
  number,
  examId,
}: {
  q: OpenQuestion;
  number: number;
  examId: string;
}) {
  const answer = useRunner(examId, (s) => s.attempt.answers[q.id]);
  const grade = useRunner(examId, (s) => s.attempt.grades[q.id]);
  const locked = useRunner(examId, (s) => s.attempt.finished);
  const { setAnswer, setGrade } = storeFor(examId).getState();

  const answered = isAnswered(q, answer ? { [q.id]: answer } : {});
  const points = Array.from({ length: q.maxPoints + 1 }, (_, i) => i);

  return (
    <section className="question" data-qid={q.id} tabIndex={-1} aria-labelledby={`q-${q.id}`}>
      <QuestionHead number={number} title={q.title} kind="assisted" />
      {q.context && (
        <p className="my-1.5 mb-2.5 rounded border-l-[3px] border-line-strong bg-paper-2 px-3.5 py-2.5 text-base">
          <RichText text={q.context} />
        </p>
      )}
      {q.table && <QuestionTable table={q.table} />}
      <p className="mb-3 mt-2 font-semibold" id={`q-${q.id}`}>
        <RichText text={q.prompt} />
      </p>
      <textarea
        className="input"
        aria-labelledby={`q-${q.id}`}
        placeholder={t("question.placeholder")}
        value={answer ?? ""}
        disabled={locked}
        maxLength={4000}
        onChange={(e) => setAnswer(q.id, e.target.value)}
      />

      {locked && (
        <>
          <div className="mt-3 rounded-lg border border-dashed border-line-strong bg-paper-2 px-3.5 py-3 text-[15px] print:hidden">
            <h4 className="text-sm font-bold text-muted">{t("question.expected")}</h4>
            <div><RichText text={q.expectedAnswer} /></div>
            {q.keyConcepts.length > 0 && (
              <>
                <h4 className="mt-2 text-sm font-bold text-muted">{t("question.concepts")}</h4>
                <ul className="list-disc pl-5">
                  {q.keyConcepts.map((c, i) => (
                    <li key={i}><RichText text={c} /></li>
                  ))}
                </ul>
              </>
            )}
            <h4 className="mt-2 text-sm font-bold text-muted">{t("question.criteria")}</h4>
            <ul className="list-disc pl-5">
              {q.criteria.map((c, i) => (
                <li key={i}><RichText text={c} /></li>
              ))}
            </ul>
          </div>

          {!answered ? (
            <p className="callout callout-warn print:hidden">
              <span className="badge badge-muted">{t("question.noAnswerBadge")}</span>{" "}
              {t("question.noAnswerNote")}
            </p>
          ) : (
            <fieldset className="mt-3 min-w-0 rounded-xl border border-warm bg-warm-soft p-3.5 print:hidden">
              <legend className="px-1 font-bold">
                {t("question.graderTitle")}{" "}
                {grade?.points !== undefined ? (
                  <span className="badge badge-ok">
                    {t("question.graded", { points: grade.points, max: q.maxPoints })}
                  </span>
                ) : (
                  <span className="badge badge-warm">{t("question.awaiting")}</span>
                )}
              </legend>
              <div className="my-2 flex flex-wrap gap-2" role="radiogroup" aria-label={t("question.pointsLabel")}>
                {points.map((p) => (
                  <label key={p} className="pick">
                    <input
                      type="radio"
                      name={`grade-${q.id}`}
                      checked={grade?.points === p}
                      onChange={() => setGrade(q.id, { points: p, comment: grade?.comment })}
                    />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
              <p className="text-[13px] text-muted">
                {q.maxPoints === 3 ? (
                  <>
                    {t("question.rubricIntro")}
                    {RUBRIC_3.map((k) => (
                      <span key={k} className="block">
                        {t(k)}
                      </span>
                    ))}
                  </>
                ) : (
                  t("question.rubricRange", { max: q.maxPoints })
                )}
              </p>
              <label className="mt-2 block">
                <span className="text-[13px] text-muted">{t("question.comment")}</span>
                <textarea
                  className="input min-h-[70px]"
                  value={grade?.comment ?? ""}
                  placeholder={t("question.commentPlaceholder")}
                  maxLength={600}
                  onChange={(e) => setGrade(q.id, { points: grade?.points, comment: e.target.value })}
                />
              </label>
              {grade?.points === undefined && (
                <p className="mt-1.5 text-[13px] text-muted">{t("question.chooseGrade")}</p>
              )}
            </fieldset>
          )}
        </>
      )}
    </section>
  );
});
