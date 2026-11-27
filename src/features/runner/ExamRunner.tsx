"use client";

import { CheckCheck, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Exam } from "@/core/schema";
import { allQuestions, countAnswered } from "@/core/score";
import { findExample } from "@/exams";
import { t } from "@/i18n";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { loadAttempt } from "@/storage/attempts";
import { loadLibrary } from "@/storage/library";
import { storageAvailable } from "@/storage/local";
import { HistoryPanel } from "./HistoryPanel";
import { McCard } from "./McCard";
import { OpenCard } from "./OpenCard";
import { PrintMenu } from "./PrintMenu";
import { PrintView, type PrintMode } from "./PrintView";
import { ProgressBar } from "./ProgressBar";
import { ReviewNav } from "./ReviewNav";
import { ResultPanel } from "./ResultPanel";
import { storeFor, useRunner } from "./store";
import { useAutosave } from "./useAutosave";

type Load = { state: "loading" } | { state: "missing" } | { state: "ready"; exam: Exam };

/** Acha o banco (exemplo ou biblioteca do usuário) e entrega ao Runner. */
export function ExamRunner({ examId }: { examId: string }) {
  const [load, setLoad] = useState<Load>({ state: "loading" });

  useEffect(() => {
    const exam = findExample(examId) ?? loadLibrary().find((e) => e.id === examId);
    setLoad(exam ? { state: "ready", exam } : { state: "missing" });
  }, [examId]);

  if (load.state === "loading")
    return (
      <div className="sheet">
        <p>{t("common.loading")}</p>
      </div>
    );
  if (load.state === "missing")
    return (
      <div className="sheet">
        <h1 className="page-title">{t("runner.notFoundTitle")}</h1>
        <p className="lead">
          {t("runner.notFoundBody", { id: examId })}
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Link className="btn btn-primary" href="/importar">
            {t("runner.importJson")}
          </Link>
          <Link className="btn" href="/">
            {t("runner.backLibrary")}
          </Link>
        </div>
      </div>
    );
  return <Runner exam={load.exam} />;
}

function Runner({ exam }: { exam: Exam }) {
  const store = storeFor(exam.id);
  const locked = useRunner(exam.id, (s) => s.attempt.finished);
  const resumed = useRunner(exam.id, (s) => s.resumed);
  const confirm = useConfirm();
  const toast = useToast();
  useAutosave(exam.id);

  // Impressão: escolher o modo mostra a folha de papel certa, imprime e volta à tela normal.
  const [printMode, setPrintMode] = useState<PrintMode | null>(null);
  useEffect(() => {
    if (!printMode) return;
    const back = () => setPrintMode(null);
    window.addEventListener("afterprint", back);
    const id = window.setTimeout(() => window.print(), 50);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("afterprint", back);
    };
  }, [printMode]);

  const questions = useMemo(() => allQuestions(exam), [exam]);
  const numberOf = useMemo(() => {
    const m = new Map<string, number>();
    questions.forEach((q, i) => m.set(q.id, i + 1));
    return m;
  }, [questions]);

  // Carrega a tentativa salva (retomada).
  useEffect(() => {
    const a = loadAttempt(exam.id);
    store
      .getState()
      .hydrate(a, countAnswered(exam, a.answers) > 0 || a.finished, storageAvailable());
  }, [exam, store]);

  async function finish() {
    const { attempt } = store.getState();
    const missing = questions.length - countAnswered(exam, attempt.answers);
    if (missing > 0) {
      const ok = await confirm({
        title: t("modal.finishTitle"),
        body: t("runner.confirmFinish", { n: missing }),
        confirmLabel: t("modal.finishConfirm"),
      });
      if (!ok) return;
    }
    store.getState().finish();
    toast("success", t("toast.finished"));
  }

  async function reset() {
    const ok = await confirm({
      title: t("modal.resetTitle"),
      body: t("runner.confirmReset"),
      confirmLabel: t("modal.resetConfirm"),
      danger: true,
    });
    if (!ok) return;
    store.getState().reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast("info", t("toast.reset"));
  }

  return (
    <>
    {printMode && <PrintView exam={exam} mode={printMode} />}
    <article className={`sheet ${printMode ? "print:hidden" : ""}`}>
      <ProgressBar exam={exam} />

      <header className="mb-5 rounded border-2 border-ink px-4 py-4 sm:px-5">
        {exam.institution && (
          <div className="text-center text-[13px] font-bold uppercase tracking-widest text-muted">
            {exam.institution}
          </div>
        )}
        <h1 className="mb-0.5 mt-1 text-center text-2xl font-bold text-accent-text">{exam.title}</h1>
        <div className="mb-3.5 text-center text-sm text-muted">
          {[exam.grade, exam.subject].filter(Boolean).join(" • ")}
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-[2fr_1fr_1fr]">
          <div className="min-h-[30px] border-b border-line-strong px-1 py-0.5">
            <strong>{t("runner.name")}</strong>
          </div>
          <div className="min-h-[30px] border-b border-line-strong px-1 py-0.5">
            <strong>{t("runner.date")}</strong> ____ / ____ / ______
          </div>
          <div className="min-h-[30px] border-b border-line-strong px-1 py-0.5">
            <strong>{t("runner.time")}</strong> ______
          </div>
        </div>
      </header>

      {resumed && !locked && <p className="callout print:hidden">{t("runner.resumed")}</p>}

      <div className="callout print:hidden">
        <strong>{t("runner.guideTitle")}</strong> {t("runner.guide")}
      </div>

      {exam.parts.map((part) => (
        <div key={part.id}>
          <h2 className="part-title">{part.title}</h2>
          {part.questions.map((q) =>
            q.type === "multiple_choice" ? (
              <McCard key={q.id} q={q} number={numberOf.get(q.id) ?? 0} examId={exam.id} />
            ) : (
              <OpenCard key={q.id} q={q} number={numberOf.get(q.id) ?? 0} examId={exam.id} />
            ),
          )}
        </div>
      ))}

      {locked && <ResultPanel exam={exam} />}
      {locked && <ReviewNav exam={exam} />}

      <div className="mb-2 mt-7 flex flex-wrap justify-center gap-2.5 print:hidden">
        <button type="button" className="btn btn-primary" onClick={finish} disabled={locked}>
          <CheckCheck size={18} aria-hidden="true" />
          {locked ? t("runner.finished") : t("runner.finish")}
        </button>
        <button type="button" className="btn" onClick={reset}>
          <RotateCcw size={18} aria-hidden="true" />
          {t("runner.reset")}
        </button>
        <PrintMenu finished={locked} onPick={setPrintMode} onPickCorrected={() => window.print()} />
      </div>

      <HistoryPanel exam={exam} />
    </article>
    </>
  );
}
