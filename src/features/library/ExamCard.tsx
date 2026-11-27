"use client";

import { Download, Play, RotateCcw, Trash2, Trophy } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import type { Exam } from "@/core/schema";
import { allQuestions } from "@/core/score";
import { t } from "@/i18n";

export interface ExamStatus {
  answered: number;
  finished: boolean;
  last?: { percent: number; final: boolean; objectivePercent: number };
}

/** Cartão de um banco na biblioteca. Memoizado: só redesenha se o seu banco ou status mudar. */
export const ExamCard = memo(function ExamCard({
  exam,
  status,
  onRemove,
  onDownload,
}: {
  exam: Exam;
  status: ExamStatus | undefined;
  /** Sem esta função o banco é um exemplo e não pode ser removido. */
  onRemove?: (exam: Exam) => void;
  onDownload: (exam: Exam) => void;
}) {
  const qs = allQuestions(exam);
  const open = qs.filter((q) => q.type === "open").length;
  const mc = qs.length - open;
  const answered = status?.answered ?? 0;
  const started = answered > 0 && !status?.finished;
  const pct = qs.length ? (answered / qs.length) * 100 : 0;
  const href = `/prova?id=${encodeURIComponent(exam.id)}`;

  return (
    <div className="card card-cream">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge">{exam.subject}</span>
        {exam.grade && <span className="badge badge-ai">{exam.grade}</span>}
      </div>
      <h3 className="text-lg font-bold">{exam.title}</h3>
      <p className="card-meta">
        {t("common.objective", { n: mc })}
        {open > 0 && ` · ${t("common.openCount", { n: open })}`} ·{" "}
        {t(exam.parts.length === 1 ? "common.partOne" : "common.partMany", {
          n: exam.parts.length,
        })}
      </p>
      {exam.description && <p className="card-meta">{exam.description}</p>}
      {started && (
        <div>
          <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <span className="block h-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
          <p className="card-meta mt-1">
            {t("library.inProgress", { answered, total: qs.length })}
          </p>
        </div>
      )}
      {status?.finished && status.last && (
        <p>
          <span className={`badge ${status.last.final ? "badge-ok" : "badge-warm"}`}>
            <Trophy size={13} aria-hidden="true" />
            {status.last.final
              ? t("library.finalGrade", { percent: status.last.percent })
              : t("library.partialGrade", { percent: status.last.objectivePercent })}
          </span>
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1.5">
        <Link className="btn btn-primary btn-sm" href={href}>
          {started ? (
            <Play size={16} aria-hidden="true" />
          ) : status?.finished ? (
            <RotateCcw size={16} aria-hidden="true" />
          ) : (
            <Play size={16} aria-hidden="true" />
          )}
          {started
            ? t("library.resume")
            : status?.finished
              ? t("library.result")
              : t("library.start")}
        </Link>
        <button type="button" className="btn btn-sm" onClick={() => onDownload(exam)}>
          <Download size={16} aria-hidden="true" />
          {t("library.download")}
        </button>
        {onRemove && (
          <button type="button" className="btn btn-sm btn-danger" onClick={() => onRemove(exam)}>
            <Trash2 size={16} aria-hidden="true" />
            {t("library.remove")}
          </button>
        )}
      </div>
    </div>
  );
});
