"use client";

import { BookOpen, ChevronDown } from "lucide-react";
import { memo } from "react";
import type { Exam } from "@/core/schema";
import type { Stage } from "@/core/stage";
import { catalogByStage, catalogExams } from "@/exams";
import { t, type MessageKey } from "@/i18n";
import { ExamCard, type ExamStatus } from "./ExamCard";

const STAGE_LABEL: Record<Stage, MessageKey> = {
  "fundamental-1": "library.stageFundamental1",
  "fundamental-2": "library.stageFundamental2",
  other: "library.stageOther",
};

/**
 * Catálogo de exemplos atrás de um painel que só abre quando a pessoa quer.
 * Assim os bancos dela continuam sendo o foco da tela inicial.
 */
export const ExamplesPanel = memo(function ExamplesPanel({
  open,
  onToggle,
  status,
  onDownload,
}: {
  open: boolean;
  onToggle: (open: boolean) => void;
  status: Record<string, ExamStatus>;
  onDownload: (exam: Exam) => void;
}) {
  const count = catalogExams.length;
  return (
    <details
      className="disclosure mt-8"
      open={open}
      onToggle={(e) => onToggle(e.currentTarget.open)}
    >
      <summary>
        <span className="grid size-9 flex-none place-items-center rounded-xl bg-accent-soft text-accent-text">
          <BookOpen size={18} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">{t("library.examplesTitle")}</span>
          <span className="block text-sm text-muted">
            {t("library.examplesCount", { n: count })}
          </span>
        </span>
        <ChevronDown size={20} aria-hidden="true" className="chevron flex-none text-muted transition-transform" />
      </summary>

      <div className="fade-in rounded-b-2xl border border-t-0 border-line bg-paper-2/40 p-4 sm:p-5">
        <p className="mb-4 text-sm text-muted">{t("library.examplesLead")}</p>

        {catalogByStage().map((g) => (
          <section key={g.stage} className="mb-6 last:mb-0" aria-label={t(STAGE_LABEL[g.stage])}>
            <h3 className="mb-2.5 text-sm font-bold uppercase tracking-wide text-muted">
              {t(STAGE_LABEL[g.stage])}
            </h3>
            <div className="grid gap-3.5 sm:grid-cols-2">
              {g.exams.map((e) => (
                <ExamCard key={e.id} exam={e} status={status[e.id]} onDownload={onDownload} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </details>
  );
});
