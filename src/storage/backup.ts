import { z } from "zod";
import { appVersion } from "@/config";
import { CreatorSchema, type CreatorFields } from "@/core/prompt";
import { validateExam, type Exam } from "@/core/schema";
import {
  AttemptSchema,
  HISTORY_LIMIT,
  HistoryEntrySchema,
  type Attempt,
  type HistoryEntry,
} from "./attempts";
import { listKeys, P } from "./local";

/**
 * Backup de tudo o que o app guarda no navegador: biblioteca, tentativas,
 * histórico e o formulário do criador. Tema e metadados ficam de fora.
 *
 * As funções de montar, ler e mesclar são puras (testáveis); só `readSnapshot`
 * e `applySnapshot` tocam o localStorage.
 */
export const BACKUP_VERSION = 1;

export interface Snapshot {
  library: Exam[];
  attempts: Record<string, Attempt>;
  history: Record<string, HistoryEntry[]>;
  creator: CreatorFields | null;
}

export const emptySnapshot = (): Snapshot => ({ library: [], attempts: {}, history: {}, creator: null });

const KEY = {
  library: `${P}.library`,
  creator: `${P}.creator`,
  attemptPrefix: `${P}.attempt.`,
  historyPrefix: `${P}.history.`,
};

// ---------------------------------------------------------------- arquivo

export interface BackupFile {
  app: "examgen";
  backupVersion: number;
  appVersion: string;
  exportedAt: string;
  library: Exam[];
  attempts: Record<string, Attempt>;
  history: Record<string, HistoryEntry[]>;
  creator: CreatorFields | null;
}

export function buildBackup(s: Snapshot, now = new Date()): BackupFile {
  return {
    app: "examgen",
    backupVersion: BACKUP_VERSION,
    appVersion,
    exportedAt: now.toISOString(),
    ...s,
  };
}

const FileSchema = z.object({
  app: z.literal("examgen"),
  backupVersion: z.number().int(),
  appVersion: z.string().optional(),
  exportedAt: z.string().optional(),
  library: z.array(z.unknown()).catch([]),
  attempts: z.record(z.string(), z.unknown()).catch({}),
  history: z.record(z.string(), z.unknown()).catch({}),
  creator: z.unknown().nullish(),
});

export type ParsedBackup =
  | { ok: false; error: string }
  | { ok: true; snapshot: Snapshot; exportedAt?: string; fromVersion?: string; skipped: string[] };

/** Lê o texto de um backup. Itens inválidos são pulados e listados; o resto é aproveitado. */
export function parseBackup(text: string): ParsedBackup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "O arquivo não é um JSON válido." };
  }
  const f = FileSchema.safeParse(raw);
  if (!f.success) return { ok: false, error: "Este arquivo não parece um backup do app (falta o campo \"app\": \"examgen\")." };
  if (f.data.backupVersion > BACKUP_VERSION) {
    return {
      ok: false,
      error: `Este backup foi gerado por uma versão mais nova do app (formato ${f.data.backupVersion}). Atualize o app para restaurá-lo.`,
    };
  }
  const skipped: string[] = [];
  const snap = emptySnapshot();
  f.data.library.forEach((item, i) => {
    const r = validateExam(item);
    if (r.ok) snap.library.push(r.exam);
    else skipped.push(`Banco ${i + 1}: formato inválido.`);
  });
  for (const [id, v] of Object.entries(f.data.attempts)) {
    const r = AttemptSchema.safeParse(v);
    if (r.success) snap.attempts[id] = r.data;
    else skipped.push(`Tentativa de “${id}”: dados inválidos.`);
  }
  for (const [id, v] of Object.entries(f.data.history)) {
    const list = Array.isArray(v) ? v : [];
    const ok = list.flatMap((x) => {
      const r = HistoryEntrySchema.safeParse(x);
      return r.success ? [r.data] : [];
    });
    if (ok.length < list.length) skipped.push(`Histórico de “${id}”: ${list.length - ok.length} registro(s) inválido(s).`);
    if (ok.length) snap.history[id] = ok;
  }
  if (f.data.creator) {
    const c = CreatorSchema.safeParse(f.data.creator);
    if (c.success) snap.creator = c.data;
    else skipped.push("Formulário do criador: dados inválidos.");
  }
  return { ok: true, snapshot: snap, exportedAt: f.data.exportedAt, fromVersion: f.data.appVersion, skipped };
}

// ---------------------------------------------------------------- mesclar

export interface MergeReport {
  examsAdded: number;
  /** Bancos com o mesmo id e conteúdo diferente: o que já estava aqui foi mantido. */
  examsKept: string[];
  attemptsAdded: number;
  attemptsUpdated: number;
  historyAdded: number;
}

/**
 * Regras da mescla (nada do que já existe é perdido sem a pessoa pedir):
 * - banco novo entra; banco com o mesmo id e conteúdo diferente: fica o atual;
 * - tentativa: vale a de `updatedAt` mais recente;
 * - histórico: união por `attemptId`, ordenada, últimas 30;
 * - criador: o atual vale; o do backup só entra se não houver um.
 */
export function mergeSnapshots(current: Snapshot, incoming: Snapshot): { snapshot: Snapshot; report: MergeReport } {
  const report: MergeReport = { examsAdded: 0, examsKept: [], attemptsAdded: 0, attemptsUpdated: 0, historyAdded: 0 };
  const library = [...current.library];
  for (const e of incoming.library) {
    const have = library.find((x) => x.id === e.id);
    if (!have) {
      library.push(e);
      report.examsAdded++;
    } else if (JSON.stringify(have) !== JSON.stringify(e)) {
      report.examsKept.push(e.title);
    }
  }
  const attempts = { ...current.attempts };
  for (const [id, a] of Object.entries(incoming.attempts)) {
    const mine = attempts[id];
    if (!mine) {
      attempts[id] = a;
      report.attemptsAdded++;
    } else if (a.updatedAt > mine.updatedAt) {
      attempts[id] = a;
      report.attemptsUpdated++;
    }
  }
  const history = { ...current.history };
  for (const [id, list] of Object.entries(incoming.history)) {
    const mine = history[id] ?? [];
    const known = new Set(mine.map((h) => h.attemptId));
    const fresh = list.filter((h) => !known.has(h.attemptId));
    if (fresh.length === 0) continue;
    report.historyAdded += fresh.length;
    history[id] = [...mine, ...fresh].sort((a, b) => a.date.localeCompare(b.date)).slice(-HISTORY_LIMIT);
  }
  return {
    snapshot: { library, attempts, history, creator: current.creator ?? incoming.creator },
    report,
  };
}

export function countSnapshot(s: Snapshot) {
  return {
    exams: s.library.length,
    attempts: Object.keys(s.attempts).length,
    history: Object.values(s.history).reduce((n, l) => n + l.length, 0),
    creator: s.creator !== null,
  };
}

// ---------------------------------------------------------------- navegador

function readJson(key: string): unknown {
  try {
    const v = window.localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

/** Lê tudo o que o app guarda (com a mesma validação das telas). */
export function readSnapshot(): Snapshot {
  const snap = emptySnapshot();
  const lib = readJson(KEY.library);
  for (const item of Array.isArray(lib) ? lib : []) {
    const r = validateExam(item);
    if (r.ok) snap.library.push(r.exam);
  }
  for (const k of listKeys()) {
    if (k.startsWith(KEY.attemptPrefix)) {
      const r = AttemptSchema.safeParse(readJson(k));
      if (r.success) snap.attempts[k.slice(KEY.attemptPrefix.length)] = r.data;
    } else if (k.startsWith(KEY.historyPrefix)) {
      const list = readJson(k);
      const ok = (Array.isArray(list) ? list : []).flatMap((x) => {
        const r = HistoryEntrySchema.safeParse(x);
        return r.success ? [r.data] : [];
      });
      if (ok.length) snap.history[k.slice(KEY.historyPrefix.length)] = ok;
    }
  }
  const rawCreator = readJson(KEY.creator);
  const c = rawCreator ? CreatorSchema.safeParse(rawCreator) : null;
  snap.creator = c?.success ? c.data : null;
  return snap;
}

function entriesOf(s: Snapshot): Map<string, string> {
  const m = new Map<string, string>();
  m.set(KEY.library, JSON.stringify(s.library));
  for (const [id, a] of Object.entries(s.attempts)) m.set(KEY.attemptPrefix + id, JSON.stringify(a));
  for (const [id, h] of Object.entries(s.history)) m.set(KEY.historyPrefix + id, JSON.stringify(h));
  if (s.creator) m.set(KEY.creator, JSON.stringify(s.creator));
  return m;
}

const isDataKey = (k: string) =>
  k === KEY.library || k === KEY.creator || k.startsWith(KEY.attemptPrefix) || k.startsWith(KEY.historyPrefix);

/**
 * Grava o snapshot. Com `replace`, apaga antes o que o app tinha. Se qualquer
 * gravação falhar (cota cheia, por exemplo), desfaz tudo e devolve false:
 * o estado anterior volta como estava.
 */
export function applySnapshot(next: Snapshot, mode: "merge" | "replace"): boolean {
  const ls = window.localStorage;
  const before = new Map<string, string | null>();
  const remember = (k: string) => {
    if (!before.has(k)) before.set(k, ls.getItem(k));
  };
  try {
    const writes = entriesOf(next);
    const stale = mode === "replace" ? listKeys().filter((k) => isDataKey(k) && !writes.has(k)) : [];
    [...writes.keys(), ...stale].forEach(remember);
    stale.forEach((k) => ls.removeItem(k));
    writes.forEach((v, k) => ls.setItem(k, v));
    return true;
  } catch {
    for (const [k, v] of before) {
      try {
        if (v === null) ls.removeItem(k);
        else ls.setItem(k, v);
      } catch {
        /* melhor esforço */
      }
    }
    return false;
  }
}

// ---------------------------------------------------------------- uso e lembrete

/** Caracteres usados pelo app no localStorage (chave + valor). Os navegadores limitam em ~5 milhões. */
export function usedChars(): number {
  let n = 0;
  for (const k of listKeys()) {
    try {
      n += k.length + (window.localStorage.getItem(k)?.length ?? 0);
    } catch {
      /* ignora */
    }
  }
  return n;
}
export const QUOTA_CHARS = 5 * 1024 * 1024;

const META_KEY = `${P}.meta`;
const MetaSchema = z.object({
  lastBackupAt: z.string().optional(),
  remindAfter: z.string().optional(),
});
export type Meta = z.output<typeof MetaSchema>;

export function loadMeta(): Meta {
  const r = MetaSchema.safeParse(readJson(META_KEY) ?? {});
  return r.success ? r.data : {};
}
export function saveMeta(m: Meta): void {
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(m));
  } catch {
    /* ignora */
  }
}

export const REMIND_EVERY_DAYS = 30;
export const SNOOZE_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;

/**
 * Lembra do backup só quando há o que perder (banco próprio ou histórico) e
 * já passaram 30 dias do último backup (ou nunca houve). "Depois" adia 7 dias.
 */
export function shouldRemind(meta: Meta, hasData: boolean, now = new Date()): boolean {
  if (!hasData) return false;
  const t = now.getTime();
  if (meta.remindAfter && Date.parse(meta.remindAfter) > t) return false;
  if (!meta.lastBackupAt) return true;
  return t - Date.parse(meta.lastBackupAt) > REMIND_EVERY_DAYS * DAY;
}
export const snoozedUntil = (now = new Date()) => new Date(now.getTime() + SNOOZE_DAYS * DAY).toISOString();
