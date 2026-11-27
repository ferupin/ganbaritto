"use client";

import { FileUp, HardDriveDownload, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { brand } from "@/config";
import type { Exam } from "@/core/schema";
import { countAnswered } from "@/core/score";
import { exampleExams } from "@/exams";
import { t } from "@/i18n";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { loadAttempt, loadHistory } from "@/storage/attempts";
import { loadMeta, saveMeta, shouldRemind, snoozedUntil } from "@/storage/backup";
import { downloadJson } from "@/storage/download";
import { loadLibrary, removeFromLibrary } from "@/storage/library";
import { ExamCard, type ExamStatus } from "./ExamCard";
import { ExamplesPanel } from "./ExamplesPanel";

function readStatus(exams: Exam[]): Record<string, ExamStatus> {
  const st: Record<string, ExamStatus> = {};
  for (const e of exams) {
    const a = loadAttempt(e.id);
    const last = loadHistory(e.id).at(-1);
    st[e.id] = {
      answered: countAnswered(e, a.answers),
      finished: a.finished,
      last: last && {
        percent: last.percent,
        final: last.final,
        objectivePercent: last.objectivePercent,
      },
    };
  }
  return st;
}

const downloadExam = (e: Exam) => downloadJson(`${e.id}.json`, e);

export function LibraryPage() {
  const [mine, setMine] = useState<Exam[]>([]);
  const [status, setStatus] = useState<Record<string, ExamStatus>>({});
  const [ready, setReady] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [remind, setRemind] = useState<"never" | "old" | null>(null);
  const confirm = useConfirm();
  const toast = useToast();

  const refresh = useCallback(() => {
    const lib = loadLibrary();
    setMine(lib);
    const st = readStatus([...lib, ...exampleExams]);
    setStatus(st);
    // Só lembra de backup quando há o que perder: banco próprio ou resultado guardado.
    const meta = loadMeta();
    const hasData = lib.length > 0 || Object.values(st).some((x) => x.last);
    setRemind(shouldRemind(meta, hasData) ? (meta.lastBackupAt ? "old" : "never") : null);
    setReady(true);
  }, []);
  useEffect(refresh, [refresh]);

  const remove = useCallback(
    async (e: Exam) => {
      const ok = await confirm({
        title: t("modal.removeTitle"),
        body: t("library.confirmRemove", { title: e.title }),
        confirmLabel: t("modal.removeConfirm"),
        danger: true,
      });
      if (!ok) return;
      removeFromLibrary(e.id);
      toast("success", t("toast.removed"));
      refresh();
    },
    [confirm, toast, refresh],
  );

  const toggleExamples = useCallback((open: boolean) => setExamplesOpen(open), []);

  return (
    <div className="sheet">
      <h1 className="page-title">{t("library.title")}</h1>
      <p className="lead">
        {brand.tagline} {t("library.lead")}
      </p>

      {remind && (
        <div className="callout flex flex-wrap items-center gap-x-4 gap-y-2" role="status" data-testid="backup-reminder">
          <HardDriveDownload size={18} aria-hidden="true" className="flex-none text-accent-text" />
          <span className="min-w-0 flex-1">{t(remind === "never" ? "reminder.never" : "reminder.old")}</span>
          <Link className="btn btn-sm btn-primary" href="/dados">
            {t("reminder.go")}
          </Link>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              saveMeta({ ...loadMeta(), remindAfter: snoozedUntil() });
              setRemind(null);
            }}
          >
            {t("reminder.later")}
          </button>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 className="section-title !mb-0 !mt-0">{t("library.mine")}</h2>
        {mine.length > 0 && (
          <div className="ml-auto flex flex-wrap gap-2">
            <Link className="btn btn-sm" href="/importar">
              <FileUp size={16} aria-hidden="true" />
              {t("library.addImport")}
            </Link>
            <Link className="btn btn-sm" href="/criar">
              <Sparkles size={16} aria-hidden="true" />
              {t("library.addCreate")}
            </Link>
          </div>
        )}
      </div>
      {!ready ? (
        <p>{t("common.loading")}</p>
      ) : mine.length === 0 ? (
        <div className="callout">
          {t("library.empty")} <Link href="/importar">{t("library.emptyImport")}</Link>{" "}
          {t("library.emptyOr")} <Link href="/criar">{t("library.emptyCreate")}</Link>.
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {mine.map((e) => (
            <ExamCard
              key={e.id}
              exam={e}
              status={status[e.id]}
              onRemove={remove}
              onDownload={downloadExam}
            />
          ))}
        </div>
      )}

      <ExamplesPanel
        open={examplesOpen}
        onToggle={toggleExamples}
        status={status}
        onDownload={downloadExam}
      />
    </div>
  );
}
