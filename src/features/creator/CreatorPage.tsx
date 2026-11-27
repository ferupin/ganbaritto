"use client";

import { Download, Eraser, FilePlus2 } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  limits,
  maxLength,
  sanitizeDigits,
  validateCreator,
  type CreatorErrors,
  type FieldCode,
} from "@/core/creator-validation";
import {
  buildPrompt,
  buildSkeleton,
  defaultFields,
  resetSimulado,
  type CreatorFields,
} from "@/core/prompt";
import { joinTags, parseTags } from "@/core/tags";
import { t } from "@/i18n";
import { Field } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { Segmented } from "@/components/ui/Segmented";
import { TagInput } from "@/components/ui/TagInput";
import { useToast } from "@/components/ui/ToastProvider";
import { clearCreator, loadCreator, saveCreator } from "@/storage/creator";
import { downloadJson } from "@/storage/download";
import { LlmLinks } from "./LlmLinks";

type Key = keyof CreatorFields;
const TAG_LIMITS = { max: 20, maxLength: 60 };

function message(code: FieldCode | undefined, key: Key): string | undefined {
  if (!code) return undefined;
  if (code === "required") return t("form.errRequired");
  if (key === "age") return t("form.errAge", limits.age);
  const rule = limits[key as keyof typeof limits];
  return t("form.errRange", { min: rule.min, max: rule.max });
}

export function CreatorPage() {
  const [f, setF] = useState<CreatorFields>(defaultFields);
  const [ready, setReady] = useState(false);
  // Campos que a pessoa já visitou (ou todos, depois de tentar copiar): só estes mostram erro.
  const [shown, setShown] = useState<Set<Key>>(new Set());
  const confirm = useConfirm();
  const toast = useToast();

  useEffect(() => {
    setF(loadCreator());
    setReady(true);
  }, []);

  // Grava pouco depois de parar de digitar (só depois de carregar, para não apagar
  // o que já estava salvo). O aviso discreto "salvo" aparece um pouco depois,
  // quando a pessoa parou de mexer, e se apaga sozinho com fade.
  useEffect(() => {
    if (!ready) return;
    let notifyTimer: ReturnType<typeof setTimeout> | undefined;
    const saveTimer = setTimeout(() => {
      if (saveCreator(f)) {
        notifyTimer = setTimeout(() => toast("saved", t("creator.saved"), { key: "saved" }), 1200);
      } else {
        toast("error", t("creator.saveFail"), { key: "save-fail" });
      }
    }, 400);
    return () => {
      clearTimeout(saveTimer);
      clearTimeout(notifyTimer);
    };
  }, [f, ready, toast]);

  const errors: CreatorErrors = useMemo(() => validateCreator(f), [f]);
  const err = (k: Key) => (shown.has(k) ? message(errors[k], k) : undefined);
  const touch = (k: Key) => setShown((s) => (s.has(k) ? s : new Set(s).add(k)));

  // O texto longo pode atrasar um quadro: a digitação continua fluida.
  const deferred = useDeferredValue(f);
  const prompt = useMemo(() => buildPrompt(deferred), [deferred]);

  const set = <K extends Key>(k: K, v: CreatorFields[K]) => setF((cur) => ({ ...cur, [k]: v }));

  const text = (k: Key, max: number) => ({
    value: f[k] as string,
    maxLength: max,
    onBlur: () => touch(k),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(k, e.target.value as never),
  });
  const digits = (k: keyof typeof limits) => ({
    value: f[k],
    inputMode: "numeric" as const,
    autoComplete: "off",
    onBlur: () => touch(k),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      set(k, sanitizeDigits(e.target.value, limits[k].digits)),
  });

  /** Barra a ação quando faltam campos obrigatórios ou há valores inválidos. */
  function guard(): boolean {
    const bad = Object.keys(errors) as Key[];
    if (bad.length === 0) return true;
    setShown(new Set(bad));
    const names = bad
      .filter((k) => errors[k] === "required")
      .map((k) => (k === "grade" ? t("form.fieldGrade") : t("form.fieldSubject")));
    toast("error", t("form.errFix", { fields: names.length ? names.join(", ") : "…" }));
    document.getElementById("creator-form")?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    return false;
  }

  async function clearAll() {
    const ok = await confirm({
      title: t("modal.clearTitle"),
      body: t("modal.clearBody"),
      confirmLabel: t("modal.clearConfirm"),
      danger: true,
    });
    if (!ok) return;
    clearCreator();
    setF(defaultFields);
    setShown(new Set());
    toast("info", t("toast.cleared"));
  }

  const topics = useMemo(() => parseTags(f.topics), [f.topics]);
  const skeleton = useMemo(() => buildSkeleton(f), [f]);
  const ph = (k: MessageKeyLike) => t(k);

  return (
    <div className="sheet">
      <h1 className="page-title">{t("creator.title")}</h1>
      <p className="lead">{t("creator.lead")}</p>

      <div id="creator-form">
        <fieldset className="mb-4 min-w-0 rounded-xl border border-line bg-paper-2 px-4 pb-4 pt-3 sm:px-[18px]">
          <legend className="px-1.5 font-extrabold text-accent-text">{t("creator.studentGroup")}</legend>
          <div className="mt-1.5 grid gap-3.5 sm:grid-cols-2">
            <Field label={t("creator.grade")} required error={err("grade")}>
              {(a) => <input className="input" type="text" placeholder={ph("creator.gradePh")} {...a} {...text("grade", maxLength.grade)} />}
            </Field>
            <Field label={t("creator.age")} error={err("age")}>
              {(a) => <input className="input" type="text" placeholder={ph("creator.agePh")} {...a} {...digits("age")} />}
            </Field>
            <Field label={t("creator.school")}>
              {(a) => <input className="input" type="text" placeholder={ph("creator.schoolPh")} {...a} {...text("institution", maxLength.institution)} />}
            </Field>
            <Field label={t("creator.city")}>
              {(a) => <input className="input" type="text" placeholder={ph("creator.cityPh")} {...a} {...text("city", maxLength.city)} />}
            </Field>
            <Field
              label={t("creator.curriculum")}
              help={{
                label: t("creator.curriculumHelpLabel"),
                body: (
                  <div className="grid gap-2">
                    <p>{t("creator.curriculumHelpWhat")}</p>
                    <p>{t("creator.curriculumHelpNetworks")}</p>
                    <p>{t("creator.curriculumHelpFind")}</p>
                  </div>
                ),
              }}
            >
              {(a) => <input className="input" type="text" placeholder={ph("creator.curriculumPh")} {...a} {...text("curriculum", maxLength.curriculum)} />}
            </Field>
            <Field label={t("creator.notes")} hint={t("common.optional")} className="sm:col-span-2">
              {(a) => <textarea className="input min-h-[70px]" placeholder={ph("creator.notesPh")} {...a} {...text("studentNotes", maxLength.studentNotes)} />}
            </Field>
          </div>
        </fieldset>

        <fieldset className="mb-4 min-w-0 rounded-xl border border-line bg-paper-2 px-4 pb-4 pt-3 sm:px-[18px]">
          <legend className="px-1.5 font-extrabold text-accent-text">{t("creator.examGroup")}</legend>
          <div className="mt-1.5 grid gap-3.5 sm:grid-cols-2">
            <Field label={t("creator.subject")} required error={err("subject")}>
              {(a) => <input className="input" type="text" placeholder={ph("creator.subjectPh")} {...a} {...text("subject", maxLength.subject)} />}
            </Field>
            <Field label={t("creator.examTitle")} hint={t("common.optional")}>
              {(a) => <input className="input" type="text" placeholder={ph("creator.examTitlePh")} {...a} {...text("title", maxLength.title)} />}
            </Field>
            <Field label={t("creator.topics")} hint={t("creator.topicsHint")} className="sm:col-span-2">
              {(a) => (
                <TagInput
                  control={a}
                  tags={topics}
                  onChange={(next) => set("topics", joinTags(next))}
                  limits={TAG_LIMITS}
                  placeholder={ph("creator.topicsPh")}
                  addLabel={t("creator.topicsAdd")}
                  listLabel={t("creator.topicsList")}
                  removeLabel={(tag) => t("creator.topicsRemove", { tag })}
                  countLabel={t("creator.topicsCount", { n: topics.length, max: TAG_LIMITS.max })}
                />
              )}
            </Field>
            <Field label={t("creator.materials")} hint={t("creator.materialsHint")} className="sm:col-span-2">
              {(a) => <textarea className="input min-h-[70px]" placeholder={ph("creator.materialsPh")} {...a} {...text("materials", maxLength.materials)} />}
            </Field>

            <div className="grid gap-1.5 sm:col-span-2">
              <span className="text-sm font-bold" id="send-what">{t("creator.sendWhat")}</span>
              <Segmented
                label={t("creator.sendWhat")}
                value={f.inputMode}
                options={[
                  { value: "images", label: t("creator.modeImages") },
                  { value: "text", label: t("creator.modeText") },
                  { value: "none", label: t("creator.modeNone") },
                ]}
                onChange={(v) => set("inputMode", v)}
              />
              <p className="text-[13px] text-muted">
                {t(f.inputMode === "none" ? "creator.modeNoneHint" : f.inputMode === "text" ? "creator.modeTextHint" : "creator.modeImagesHint")}
              </p>
            </div>

            <Field label={t("creator.objectiveCount")} hint={t("creator.objectiveHint")} error={err("objectiveCount")}>
              {(a) => <input className="input" type="text" placeholder={ph("creator.objectivePh")} {...a} {...digits("objectiveCount")} />}
            </Field>
            <Field label={t("creator.openCount")} error={err("openCount")}>
              {(a) => <input className="input" type="text" placeholder={ph("creator.openPh")} {...a} {...digits("openCount")} />}
            </Field>
            <Field
              label={t("creator.partsCount")}
              hint={t("creator.partsHint")}
              error={err("partsCount")}
              help={{ label: t("creator.partsCount"), body: <p>{t("creator.partsHelp")}</p> }}
            >
              {(a) => <input className="input" type="text" placeholder={ph("creator.partsPh")} {...a} {...digits("partsCount")} />}
            </Field>
            <div className="grid content-start gap-1.5">
              <span className="flex min-h-7 items-center text-sm font-bold">{t("creator.level")}</span>
              <Segmented
                label={t("creator.level")}
                value={f.difficulty}
                equal
                options={[
                  { value: "revisao", label: t("creator.levelReview"), tone: "ok" },
                  { value: "medio", label: t("creator.levelMedium"), tone: "warm" },
                  { value: "desafio", label: t("creator.levelChallenge"), tone: "bad" },
                ]}
                onChange={(v) => set("difficulty", v)}
              />
              <p className="text-xs text-muted" aria-live="polite">
                {t(
                  f.difficulty === "revisao"
                    ? "creator.levelReviewHint"
                    : f.difficulty === "medio"
                      ? "creator.levelMediumHint"
                      : "creator.levelChallengeHint",
                )}
              </p>
            </div>
            <Field label={t("creator.extras")} hint={t("common.optional")} className="sm:col-span-2">
              {(a) => <textarea className="input min-h-[70px]" placeholder={ph("creator.extrasPh")} {...a} {...text("extraStyle", maxLength.extraStyle)} />}
            </Field>

            <div className="grid gap-2.5 sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-2.5 text-[15px]">
                <input type="checkbox" className="mt-0.5 size-[22px] flex-none accent-accent" checked={f.mimicSchool} onChange={(e) => set("mimicSchool", e.target.checked)} />
                <span>{t("creator.mimic")}</span>
              </label>
              <label className="flex cursor-pointer items-start gap-2.5 text-[15px]">
                <input type="checkbox" className="mt-0.5 size-[22px] flex-none accent-accent" checked={f.allowExternal || f.inputMode === "none"} disabled={f.inputMode === "none"} onChange={(e) => set("allowExternal", e.target.checked)} />
                <span>{t(f.inputMode === "none" ? "creator.externalForced" : "creator.external")}</span>
              </label>
            </div>
          </div>
        </fieldset>
      </div>

      <h2 className="section-title">{t("creator.promptTitle")}</h2>
      <p className="mb-2.5 text-muted">
        {t(f.inputMode === "none" ? "creator.promptLeadNone" : f.inputMode === "text" ? "creator.promptLeadText" : "creator.promptLead")}
      </p>
      <textarea
        className="input min-h-80 font-mono text-[13px] leading-normal"
        readOnly
        value={prompt}
        aria-label={t("creator.promptLabel")}
        onFocus={(e) => e.currentTarget.select()}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2.5 border border-line px-3 py-3 on-dark rounded-xl bg-paper text-ink sm:sticky sm:bottom-0 sm:z-[4] print:hidden">
        <CopyButton
          text={prompt}
          label={t("creator.copy")}
          successMessage={t("toast.copied")}
          beforeCopy={guard}
        />
        <button
          type="button"
          className="btn"
          onClick={() => {
            downloadJson(`${skeleton.id}-esqueleto.json`, skeleton);
            toast("success", t("toast.skeleton"));
          }}
        >
          <Download size={18} aria-hidden="true" />
          {t("creator.skeleton")}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setF((c) => resetSimulado(c));
            toast("info", t("toast.newExam"));
          }}
        >
          <FilePlus2 size={18} aria-hidden="true" />
          {t("creator.newExam")}
        </button>
        <button type="button" className="btn btn-danger" onClick={clearAll}>
          <Eraser size={18} aria-hidden="true" />
          {t("creator.clearAll")}
        </button>
      </div>

      <ol className="mt-5 grid gap-3 sm:grid-cols-3">
        {(["creator.step1", f.inputMode === "none" ? "creator.step2None" : f.inputMode === "text" ? "creator.step2Text" : "creator.step2", "creator.step3"] as const).map((k, i) => (
          <li key={k} className="rounded-xl border border-line bg-paper-2 px-4 py-3.5">
            <span className="mb-1.5 grid size-7 place-items-center rounded-full bg-warm font-extrabold text-paper">
              {i + 1}
            </span>
            <strong>
              {t(k)}
              {i === 2 && (
                <>
                  {" "}
                  <Link href="/importar">{t("nav.import")}</Link>
                </>
              )}
            </strong>
          </li>
        ))}
      </ol>

      <LlmLinks />
    </div>
  );
}

type MessageKeyLike = Parameters<typeof t>[0];
