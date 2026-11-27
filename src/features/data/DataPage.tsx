"use client";

import { brand } from "@/config";
import { CircleAlert, Download, HardDrive, ShieldCheck, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { t } from "@/i18n";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { useToast } from "@/components/ui/ToastProvider";
import {
  applySnapshot,
  buildBackup,
  countSnapshot,
  loadMeta,
  mergeSnapshots,
  parseBackup,
  QUOTA_CHARS,
  readSnapshot,
  saveMeta,
  usedChars,
  type MergeReport,
  type Snapshot,
} from "@/storage/backup";
import { downloadJson } from "@/storage/download";

const MAX_FILE = 20 * 1024 * 1024;

type Loaded = { snapshot: Snapshot; exportedAt?: string; fromVersion?: string; skipped: string[] };
type Mode = "merge" | "replace";

const dateBR = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : t("data.restoreUnknownDate"));
const kb = (chars: number) => `${Math.round(chars / 1024).toLocaleString("pt-BR")} KB`;

export function DataPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);
  const [now, setNow] = useState<Snapshot | null>(null);
  const [lastBackup, setLastBackup] = useState<string | undefined>();
  const [used, setUsed] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [mode, setMode] = useState<Mode>("merge");
  const [summary, setSummary] = useState<{ text: string; extra?: string } | null>(null);
  const [fileError, setFileError] = useState("");
  const [persist, setPersist] = useState<"unknown" | "yes" | "no" | "unsupported">("unknown");

  function refresh() {
    setNow(readSnapshot());
    setLastBackup(loadMeta().lastBackupAt);
    setUsed(usedChars());
  }
  useEffect(() => {
    refresh();
    if (!navigator.storage?.persisted) return setPersist("unsupported");
    navigator.storage.persisted().then((p) => setPersist(p ? "yes" : "unknown"));
  }, []);

  function backup() {
    const snap = readSnapshot();
    const day = new Date().toISOString().slice(0, 10);
    downloadJson(`${brand.slug}-backup-${day}.json`, buildBackup(snap));
    saveMeta({ ...loadMeta(), lastBackupAt: new Date().toISOString(), remindAfter: undefined });
    toast("success", t("data.backupDone"));
    refresh();
  }

  async function pick(file: File | undefined) {
    if (!file) return;
    setSummary(null);
    setFileError("");
    if (file.size > MAX_FILE) {
      setLoaded(null);
      return setFileError(t("data.fileTooBig"));
    }
    const r = parseBackup(await file.text());
    if (!r.ok) {
      setLoaded(null);
      return setFileError(r.error);
    }
    setLoaded({ snapshot: r.snapshot, exportedAt: r.exportedAt, fromVersion: r.fromVersion, skipped: r.skipped });
  }

  async function restore() {
    if (!loaded) return;
    if (mode === "replace") {
      const ok = await confirm({
        title: t("data.confirmReplaceTitle"),
        body: t("data.confirmReplaceBody"),
        confirmLabel: t("data.confirmReplaceYes"),
        danger: true,
      });
      if (!ok) return;
    }
    let report: MergeReport | null = null;
    let next = loaded.snapshot;
    if (mode === "merge") {
      const m = mergeSnapshots(readSnapshot(), loaded.snapshot);
      next = m.snapshot;
      report = m.report;
    }
    if (!applySnapshot(next, mode)) {
      toast("error", t("data.restoreFailed"));
      return;
    }
    setSummary(
      mode === "replace"
        ? { text: t("data.restoredReplace") }
        : {
            text: t("data.restoredMerge", {
              added: report!.examsAdded,
              attemptsAdded: report!.attemptsAdded,
              attemptsUpdated: report!.attemptsUpdated,
              history: report!.historyAdded,
            }),
            extra: report!.examsKept.length ? t("data.restoredKept", { titles: report!.examsKept.join(", ") }) : undefined,
          },
    );
    toast("success", t("toast.restored"));
    setLoaded(null);
    refresh();
  }

  async function askPersist() {
    if (!navigator.storage?.persist) return setPersist("unsupported");
    setPersist((await navigator.storage.persist()) ? "yes" : "no");
  }

  const c = now ? countSnapshot(now) : { exams: 0, attempts: 0, history: 0 };
  const lc = loaded ? countSnapshot(loaded.snapshot) : null;
  const pct = Math.min(100, (used / QUOTA_CHARS) * 100);

  return (
    <div className="sheet">
      <h1 className="page-title">{t("data.title")}</h1>
      <p className="lead">{t("data.lead")}</p>

      <section className="card mt-5" aria-labelledby="d-backup">
        <h2 id="d-backup" className="flex items-center gap-2.5 text-base font-bold">
          <Download size={18} aria-hidden="true" className="text-accent-text" />
          {t("data.backupTitle")}
        </h2>
        <p className="text-sm text-muted">{t("data.backupBody")}</p>
        <p className="text-sm" data-testid="backup-counts">
          {t("data.backupHas", { exams: c.exams, attempts: c.attempts, history: c.history })}
        </p>
        <p className="text-sm text-muted" data-testid="backup-last">
          {lastBackup ? t("data.backupLast", { date: dateBR(lastBackup) }) : t("data.backupNever")}
        </p>
        <div>
          <button type="button" className="btn btn-primary" onClick={backup}>
            <Download size={18} aria-hidden="true" />
            {t("data.backupButton")}
          </button>
        </div>
      </section>

      <section className="card mt-4" aria-labelledby="d-restore">
        <h2 id="d-restore" className="flex items-center gap-2.5 text-base font-bold">
          <Upload size={18} aria-hidden="true" className="text-accent-text" />
          {t("data.restoreTitle")}
        </h2>
        <p className="text-sm text-muted">{t("data.restoreBody")}</p>
        <div>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            <Upload size={18} aria-hidden="true" />
            {t("data.restoreChoose")}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            aria-label={t("data.restoreChooseLabel")}
            onChange={(e) => {
              void pick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        {fileError && (
          <p className="callout callout-bad" role="alert">
            <CircleAlert size={16} aria-hidden="true" className="mr-1 inline" />
            {fileError}
          </p>
        )}

        {loaded && lc && (
          <div className="grid gap-3 rounded-xl border border-line bg-paper p-3.5" data-testid="restore-preview">
            <p className="font-semibold">
              {t("data.restoreFound", {
                date: dateBR(loaded.exportedAt),
                version: loaded.fromVersion ?? "?",
                exams: lc.exams,
                attempts: lc.attempts,
                history: lc.history,
              })}
            </p>
            {loaded.skipped.length > 0 && (
              <div className="callout callout-warn">
                <p>{t("data.restoreSkipped", { n: loaded.skipped.length })}</p>
                <ul className="list-disc pl-5 text-sm">
                  {loaded.skipped.slice(0, 8).map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-bold">{t("data.restoreModeLabel")}</legend>
              {(["merge", "replace"] as const).map((m) => (
                <label key={m} className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="radio"
                    name="restore-mode"
                    className="mt-1 size-[18px] accent-accent"
                    checked={mode === m}
                    onChange={() => setMode(m)}
                  />
                  <span>
                    <strong>{t(m === "merge" ? "data.modeMerge" : "data.modeReplace")}</strong>
                    <span className="block text-sm text-muted">
                      {t(m === "merge" ? "data.modeMergeHint" : "data.modeReplaceHint")}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={`btn ${mode === "replace" ? "btn-danger" : "btn-primary"}`} onClick={() => void restore()}>
                {t("data.restoreButton")}
              </button>
              <button type="button" className="btn" onClick={() => setLoaded(null)}>
                <X size={18} aria-hidden="true" />
                {t("data.restoreCancel")}
              </button>
            </div>
          </div>
        )}

        {summary && (
          <div className="callout callout-ok" role="status" data-testid="restore-summary">
            <p>{summary.text}</p>
            {summary.extra && <p className="mt-1 text-sm">{summary.extra}</p>}
          </div>
        )}
      </section>

      <section className="card mt-4" aria-labelledby="d-storage">
        <h2 id="d-storage" className="flex items-center gap-2.5 text-base font-bold">
          <HardDrive size={18} aria-hidden="true" className="text-accent-text" />
          {t("data.storageTitle")}
        </h2>
        <p className="text-sm">{t("data.storageUsed", { used: kb(used), total: kb(QUOTA_CHARS) })}</p>
        <div
          className="h-2.5 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-label={t("data.storageTitle")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          <span className={`block h-full ${pct > 80 ? "bg-bad" : "bg-accent"}`} style={{ width: `${pct}%` }} />
        </div>
        {pct > 80 && <p className="callout callout-warn">{t("data.storageWarn")}</p>}
        <h3 className="mt-2 flex items-center gap-2 text-sm font-bold">
          <ShieldCheck size={16} aria-hidden="true" className="text-accent-text" />
          {t("data.persistTitle")}
        </h3>
        <p className="text-sm text-muted">{t("data.persistBody")}</p>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-sm" onClick={() => void askPersist()} disabled={persist === "yes" || persist === "unsupported"}>
            {t("data.persistButton")}
          </button>
          {persist === "yes" && <span className="text-sm text-ok">{t("data.persistYes")}</span>}
          {persist === "no" && <span className="text-sm text-bad">{t("data.persistNo")}</span>}
          {persist === "unsupported" && <span className="text-sm text-muted">{t("data.persistUnsupported")}</span>}
        </div>
      </section>
    </div>
  );
}
