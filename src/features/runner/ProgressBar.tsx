"use client";

import { CircleAlert, CircleCheck, Save } from "lucide-react";
import { useMemo } from "react";
import type { Exam } from "@/core/schema";
import { allQuestions, countAnswered } from "@/core/score";
import { t } from "@/i18n";
import { useRunner } from "./store";

/** Barra fixa no topo da folha: progresso e estado do salvamento. Lê só as respostas e o status. */
export function ProgressBar({ exam }: { exam: Exam }) {
  const answers = useRunner(exam.id, (s) => s.attempt.answers);
  const save = useRunner(exam.id, (s) => s.save);
  const total = useMemo(() => allQuestions(exam).length, [exam]);
  const answered = countAnswered(exam, answers);
  const pct = total ? (answered / total) * 100 : 0;

  const status =
    save === "off"
      ? { Icon: CircleAlert, text: t("runner.saveOff"), cls: "text-bad" }
      : save === "saved"
        ? { Icon: CircleCheck, text: t("runner.saved"), cls: "text-ok" }
        : save === "error"
          ? { Icon: CircleAlert, text: t("runner.saveError"), cls: "text-bad" }
          : { Icon: Save, text: t("runner.saveIdle"), cls: "text-muted" };

  return (
    <div className="sticky top-0 z-10 -mx-4 -mt-6 mb-5 border-b border-line bg-paper px-4 py-2.5 sm:-mx-8 sm:-mt-9 sm:rounded-t-md sm:px-8 lg:-mx-11 lg:px-11 print:hidden">
      <div className="flex flex-wrap justify-between gap-x-3 text-sm text-muted">
        <span>
          {t("runner.progress", { answered, total })}
        </span>
        <span className={`inline-flex items-center gap-1.5 ${status.cls}`} aria-live="polite">
          <status.Icon size={15} aria-hidden="true" />
          {status.text}
        </span>
      </div>
      <div
        className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label={t("runner.progressLabel")}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answered}
      >
        <span className="block h-full bg-accent transition-[width] duration-200" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
