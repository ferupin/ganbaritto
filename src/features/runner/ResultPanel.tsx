"use client";

import { useEffect, useRef } from "react";
import type { Exam } from "@/core/schema";
import { t } from "@/i18n";
import { useResult } from "./useResult";

/** Resultado da prova corrigida. A nota final só aparece sem discursivas pendentes. */
export function ResultPanel({ exam }: { exam: Exam }) {
  const result = useResult(exam);
  const ref = useRef<HTMLDivElement>(null);

  // Ao aparecer, leva o resultado para o centro da tela (uma vez).
  useEffect(() => {
    const id = setTimeout(
      () => ref.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
      80,
    );
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      ref={ref}
      data-testid="result"
      className="my-6 rounded-xl border-2 border-ink bg-accent-soft p-4 sm:p-5 print:hidden"
      aria-live="polite"
    >
      <div className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        {t("runner.resultObjective", {
          hits: result.objective.hits,
          total: result.objective.total,
          percent: result.objectivePercent,
        })}
      </div>
      {result.objective.unanswered > 0 && (
        <p className="mt-2">{t("runner.unansweredNote", { n: result.objective.unanswered })}</p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        <div className="rounded-xl border border-line bg-paper px-3.5 py-3">
          <span className="badge">{t("runner.autoBadge")}</span>
          <p>
            {t("runner.objectivePoints", {
              earned: result.objective.earned,
              max: result.objective.max,
            })}
          </p>
        </div>
        {result.open.total > 0 && (
          <div className="rounded-xl border border-line bg-paper px-3.5 py-3">
            <span className="badge badge-warm">{t("runner.assistedBadge")}</span>
            <p>
              {t("runner.openPoints", { earned: result.open.earned, max: result.open.max })}{" "}
              {result.open.pending > 0
                ? t("runner.openPending", { n: result.open.pending })
                : t("runner.openDone")}
            </p>
          </div>
        )}
        <div className="rounded-xl border border-line bg-paper px-3.5 py-3">
          {result.final ? (
            <>
              <span className="badge badge-ok">{t("runner.finalBadge")}</span>
              <p>
                <strong>
                  {t("runner.finalValue", {
                    earned: result.earned,
                    max: result.max,
                    percent: result.percent,
                  })}
                </strong>
              </p>
            </>
          ) : (
            <>
              <span className="badge badge-muted">{t("runner.partialBadge")}</span>
              <p>{t("runner.partialNote", { n: result.open.pending })}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
