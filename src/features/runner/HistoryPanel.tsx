"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import type { Exam } from "@/core/schema";
import { t } from "@/i18n";
import { useToast } from "@/components/ui/ToastProvider";
import { loadHistory, upsertHistory, type HistoryEntry } from "@/storage/attempts";
import { downloadJson } from "@/storage/download";
import { storeFor, useRunner } from "./store";
import { useResult } from "./useResult";

/**
 * Histórico das últimas 30 tentativas. Depois de finalizada, a tentativa
 * continua sendo atualizada aqui conforme o responsável corrige as discursivas.
 */
export function HistoryPanel({ exam }: { exam: Exam }) {
  const finished = useRunner(exam.id, (s) => s.attempt.finished);
  const hydrated = useRunner(exam.id, (s) => s.hydrated);
  const result = useResult(exam);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const toast = useToast();

  useEffect(() => {
    if (hydrated) setHistory(loadHistory(exam.id));
  }, [hydrated, exam.id]);

  useEffect(() => {
    if (!hydrated || !finished) return;
    const a = storeFor(exam.id).getState().attempt;
    upsertHistory(exam.id, {
      attemptId: a.attemptId,
      date: a.finishedAt ?? a.updatedAt,
      hits: result.objective.hits,
      objectiveTotal: result.objective.total,
      objectivePercent: result.objectivePercent,
      earned: result.earned,
      max: result.max,
      percent: result.percent,
      final: result.final,
    });
    setHistory(loadHistory(exam.id));
  }, [hydrated, finished, result, exam.id]);

  function exportHistory() {
    downloadJson(`historico_${exam.id}.json`, {
      exam: { id: exam.id, title: exam.title },
      exportedAt: new Date().toISOString(),
      history,
    });
    toast("success", t("toast.historyExported"));
  }

  return (
    <details className="mt-5 border-t border-line pt-3 print:hidden">
      <summary className="font-bold text-accent-text">
        {t("runner.historyTitle", { n: history.length })}
      </summary>
      {history.length === 0 ? (
        <p className="mt-2 text-[13px] text-muted">{t("runner.historyEmpty")}</p>
      ) : (
        <>
          <ol className="mt-2 list-decimal pl-5 text-sm text-muted">
            {history
              .slice()
              .reverse()
              .map((h) => (
                <li key={h.attemptId}>
                  {t("runner.historyItem", {
                    date: new Date(h.date).toLocaleString("pt-BR"),
                    hits: h.hits,
                    total: h.objectiveTotal,
                    percent: h.objectivePercent,
                  })}{" "}
                  ·{" "}
                  {h.final
                    ? t("runner.historyFinal", { percent: h.percent })
                    : t("runner.historyPending")}
                </li>
              ))}
          </ol>
          <button type="button" className="btn btn-sm mt-2" onClick={exportHistory}>
            <Download size={16} aria-hidden="true" />
            {t("runner.historyExport")}
          </button>
        </>
      )}
    </details>
  );
}
