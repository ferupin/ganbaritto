import { RichText } from "@/components/math/RichText";
import { answerKey, answerLines } from "@/core/print";
import type { Exam, Question } from "@/core/schema";
import { allQuestions } from "@/core/score";
import { t } from "@/i18n";
import { QuestionTable } from "./QuestionTable";

export type PrintMode = "caderno" | "gabarito";

const RUBRIC_3 = ["question.rubric0", "question.rubric1", "question.rubric2", "question.rubric3"] as const;

/**
 * Versão só para papel. Aparece apenas na impressão (`hidden print:block`) e
 * nunca mostra o que não pertence à folha: o caderno não tem gabarito nem
 * explicações; o gabarito é uma folha separada para o responsável.
 */
export function PrintView({ exam, mode }: { exam: Exam; mode: PrintMode }) {
  const questions = allQuestions(exam);
  const number = new Map(questions.map((q, i) => [q.id, i + 1]));
  return (
    <div className="print-sheet hidden print:block" data-print-mode={mode}>
      <header className="print-head">
        {exam.institution && <div className="print-inst">{exam.institution}</div>}
        <h1>
          {mode === "gabarito" ? `${t("print.keyTitle")}: ` : ""}
          {exam.title}
        </h1>
        <div>{[exam.grade, exam.subject].filter(Boolean).join(" • ")}</div>
        {mode === "caderno" && (
          <div className="print-fields">
            <span>{t("runner.name")} ______________________________________</span>
            <span>{t("runner.date")} ____ / ____ / ______</span>
            <span>{t("print.class")} __________</span>
          </div>
        )}
      </header>

      {mode === "gabarito" && <KeyTable questions={questions} />}

      {exam.parts.map((part) => (
        <section key={part.id}>
          <h2 className="part-title">{part.title}</h2>
          {part.questions.map((q) =>
            mode === "caderno" ? (
              <Blank key={q.id} q={q} n={number.get(q.id) ?? 0} />
            ) : (
              <KeyItem key={q.id} q={q} n={number.get(q.id) ?? 0} />
            ),
          )}
        </section>
      ))}
    </div>
  );
}

function Blank({ q, n }: { q: Question; n: number }) {
  return (
    <div className="print-q print-row">
      <b className="print-num">{n}.</b>
      <div className="print-body">
        {q.title && (
          <p>
            <b>{q.title}</b>
          </p>
        )}
        {q.context && (
          <p className="print-context">
            <RichText text={q.context} />
          </p>
        )}
        {q.table && <QuestionTable table={q.table} />}
        <p className="print-prompt">
          <RichText text={q.prompt} />
        </p>
        {q.type === "multiple_choice" ? (
          <>
            {q.statements?.map((s, i) => (
              <p key={i} className="print-stmt">
                <b>{["I", "II", "III", "IV", "V", "VI"][i] ?? i + 1}.</b> <RichText text={s} />
              </p>
            ))}
            {q.options.map((o) => (
              <p key={o.id} className="print-opt">
                <span className="print-bubble" aria-hidden="true" />
                <span>
                  <b>{o.id.toUpperCase()})</b> <RichText text={o.text} />
                </span>
              </p>
            ))}
          </>
        ) : (
          <div className="print-lines" aria-hidden="true">
            {Array.from({ length: answerLines(q.maxPoints) }, (_, i) => (
              <div key={i} className="print-line" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KeyTable({ questions }: { questions: Question[] }) {
  const key = answerKey(questions);
  return (
    <div className="print-key" aria-label={t("print.keyTitle")}>
      {key.map((k) => (
        <span key={k.number}>
          <b>{k.number}</b> – {k.letter}
        </span>
      ))}
    </div>
  );
}

function KeyItem({ q, n }: { q: Question; n: number }) {
  return (
    <div className="print-q">
      {q.type === "multiple_choice" ? (
        <>
          <p>
            <b>{n}.</b> {t("print.rightIs")}{" "}
            <b>{String.fromCharCode(65 + q.options.findIndex((o) => o.id === q.answer))}</b>
            {" "}(<RichText text={q.options.find((o) => o.id === q.answer)?.text ?? ""} />)
          </p>
          <p className="print-expl">
            <RichText text={q.explanation} />
          </p>
        </>
      ) : (
        <>
          <p>
            <b>{n}.</b> {t("print.openExpected")} <RichText text={q.expectedAnswer} />
          </p>
          <ul className="print-list">
            {q.keyConcepts.map((c, i) => (
              <li key={`k${i}`}>
                <RichText text={c} />
              </li>
            ))}
            {q.criteria.map((c, i) => (
              <li key={`c${i}`}>
                <RichText text={c} />
              </li>
            ))}
          </ul>
          {q.maxPoints === 3 ? (
            <p className="print-expl">{RUBRIC_3.map((k) => t(k)).join(" ")}</p>
          ) : (
            <p className="print-expl">{t("question.rubricRange", { max: q.maxPoints })}</p>
          )}
        </>
      )}
    </div>
  );
}
