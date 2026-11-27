import { beforeEach, describe, expect, it } from "vitest";
import { validateExam, type Exam } from "@/core/schema";
import { templateExam } from "@/core/template";
import { defaultFields } from "@/core/prompt";
import { newAttempt, type HistoryEntry } from "./attempts";
import {
  applySnapshot,
  buildBackup,
  countSnapshot,
  emptySnapshot,
  mergeSnapshots,
  parseBackup,
  readSnapshot,
  shouldRemind,
  snoozedUntil,
  type Snapshot,
} from "./backup";

/** localStorage de mentira, com cota opcional para simular "armazenamento cheio". */
function fakeStorage(limitChars = Infinity) {
  const map = new Map<string, string>();
  const size = () => [...map].reduce((n, [k, v]) => n + k.length + v.length, 0);
  return {
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem(k: string, v: string) {
      const old = map.get(k);
      map.set(k, v);
      if (size() > limitChars) {
        if (old === undefined) map.delete(k);
        else map.set(k, old);
        throw new Error("QuotaExceededError");
      }
    },
    removeItem: (k: string) => void map.delete(k),
  };
}
function install(limit?: number) {
  (globalThis as any).window = { localStorage: fakeStorage(limit) };
}

const parsedTemplate = validateExam(templateExam);
if (!parsedTemplate.ok) throw new Error("template inválido");
const exam: Exam = parsedTemplate.exam;
const other: Exam = { ...exam, id: "outro-banco", title: "Outro" };
const entry = (id: string, date: string): HistoryEntry => ({
  attemptId: id, date, hits: 1, objectiveTotal: 2, objectivePercent: 50, earned: 1, max: 2, percent: 50, final: true,
});
const attempt = (updatedAt: string) => ({ ...newAttempt(), answers: { q01: "a" }, updatedAt });

function sample(): Snapshot {
  return {
    library: [exam],
    attempts: { [exam.id]: attempt("2026-11-01T10:00:00.000Z") },
    history: { [exam.id]: [entry("t1", "2026-11-01")] },
    creator: { ...defaultFields, subject: "História" },
  };
}

beforeEach(() => install());

describe("ida e volta", () => {
  it("grava, lê, exporta e importa sem perder nada", () => {
    expect(applySnapshot(sample(), "replace")).toBe(true);
    const back = readSnapshot();
    expect(countSnapshot(back)).toEqual({ exams: 1, attempts: 1, history: 1, creator: true });
    const file = JSON.stringify(buildBackup(back));
    install(); // navegador novo e vazio
    const p = parseBackup(file);
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(p.skipped).toEqual([]);
    applySnapshot(p.snapshot, "replace");
    const again = readSnapshot();
    expect(again.library[0].id).toBe(exam.id);
    expect(again.attempts[exam.id].answers.q01).toBe("a");
    expect(again.creator?.subject).toBe("História");
  });
});

describe("leitura do arquivo", () => {
  it("recusa texto que não é JSON, arquivo de outro app e formato mais novo", () => {
    expect(parseBackup("{ nada").ok).toBe(false);
    expect(parseBackup('{"x":1}').ok).toBe(false);
    const r = parseBackup(JSON.stringify({ app: "examgen", backupVersion: 99 }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/versão mais nova/);
  });
  it("pula itens inválidos e aproveita o resto", () => {
    const file = JSON.stringify({
      ...buildBackup(sample()),
      library: [exam, { id: "quebrado" }],
      attempts: { ok: attempt("2026-11-02T00:00:00.000Z"), ruim: { attemptId: 5 } },
    });
    const r = parseBackup(file);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.snapshot.library).toHaveLength(1);
    expect(Object.keys(r.snapshot.attempts)).toEqual(["ok"]);
    expect(r.skipped).toHaveLength(2);
  });
});

describe("mesclar", () => {
  it("acrescenta o que falta e nunca sobrescreve banco diferente com o mesmo id", () => {
    const current: Snapshot = { ...emptySnapshot(), library: [exam] };
    const changed = { ...exam, title: "Título editado" };
    const incoming: Snapshot = { ...emptySnapshot(), library: [changed, other] };
    const { snapshot, report } = mergeSnapshots(current, incoming);
    expect(snapshot.library.map((e) => e.id).sort()).toEqual([exam.id, "outro-banco"].sort());
    expect(snapshot.library.find((e) => e.id === exam.id)?.title).toBe(exam.title);
    expect(report.examsAdded).toBe(1);
    expect(report.examsKept).toEqual(["Título editado"]);
  });
  it("tentativa: vale a mais recente; histórico: união sem repetir", () => {
    const current: Snapshot = { ...emptySnapshot(), attempts: { a: attempt("2026-11-05T00:00:00.000Z"), b: attempt("2026-11-01T00:00:00.000Z") }, history: { a: [entry("t1", "2026-11-01")] } };
    const incoming: Snapshot = { ...emptySnapshot(), attempts: { a: attempt("2026-11-02T00:00:00.000Z"), b: attempt("2026-11-09T00:00:00.000Z"), c: attempt("2026-11-03T00:00:00.000Z") }, history: { a: [entry("t1", "2026-11-01"), entry("t2", "2026-11-02")] } };
    const { snapshot, report } = mergeSnapshots(current, incoming);
    expect(snapshot.attempts.a.updatedAt).toBe("2026-11-05T00:00:00.000Z");
    expect(snapshot.attempts.b.updatedAt).toBe("2026-11-09T00:00:00.000Z");
    expect(Object.keys(snapshot.attempts).sort()).toEqual(["a", "b", "c"]);
    expect(snapshot.history.a.map((h) => h.attemptId)).toEqual(["t1", "t2"]);
    expect(report).toMatchObject({ attemptsAdded: 1, attemptsUpdated: 1, historyAdded: 1 });
  });
  it("histórico respeita o limite de 30", () => {
    const many = Array.from({ length: 30 }, (_, i) => entry(`m${i}`, `2026-10-${String(i + 1).padStart(2, "0")}`));
    const { snapshot } = mergeSnapshots({ ...emptySnapshot(), history: { a: many } }, { ...emptySnapshot(), history: { a: [entry("novo", "2026-11-20")] } });
    expect(snapshot.history.a).toHaveLength(30);
    expect(snapshot.history.a.at(-1)?.attemptId).toBe("novo");
  });
  it("o formulário atual vale; o do backup só entra se não houver", () => {
    const a = { ...defaultFields, subject: "atual" };
    const b = { ...defaultFields, subject: "backup" };
    expect(mergeSnapshots({ ...emptySnapshot(), creator: a }, { ...emptySnapshot(), creator: b }).snapshot.creator?.subject).toBe("atual");
    expect(mergeSnapshots(emptySnapshot(), { ...emptySnapshot(), creator: b }).snapshot.creator?.subject).toBe("backup");
  });
});

describe("substituir", () => {
  it("apaga o que não está no backup", () => {
    applySnapshot(sample(), "replace");
    applySnapshot({ ...emptySnapshot(), library: [other] }, "replace");
    const s = readSnapshot();
    expect(s.library.map((e) => e.id)).toEqual(["outro-banco"]);
    expect(s.attempts).toEqual({});
    expect(s.history).toEqual({});
  });
  it("cota cheia no meio: desfaz tudo e o estado anterior volta", () => {
    applySnapshot(sample(), "replace");
    const before = JSON.stringify(readSnapshot());
    const size = [...Array(window.localStorage.length).keys()].reduce((n, i) => {
      const k = window.localStorage.key(i)!;
      return n + k.length + window.localStorage.getItem(k)!.length;
    }, 0);
    (globalThis as any).window.localStorage = Object.assign(window.localStorage, {});
    // troca por um armazenamento com o mesmo conteúdo e cota apertada
    const tight = fakeStorage(size + 50);
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)!;
      tight.setItem(k, window.localStorage.getItem(k)!);
    }
    (globalThis as any).window = { localStorage: tight };
    const huge: Snapshot = { ...emptySnapshot(), library: [{ ...other, title: "x".repeat(5000) }] };
    expect(applySnapshot(huge, "replace")).toBe(false);
    expect(JSON.stringify(readSnapshot())).toBe(before);
  });
});

describe("lembrete de backup", () => {
  const now = new Date("2026-11-25T12:00:00.000Z");
  it("não lembra sem dados; lembra se nunca fez backup", () => {
    expect(shouldRemind({}, false, now)).toBe(false);
    expect(shouldRemind({}, true, now)).toBe(true);
  });
  it("só passados 30 dias do último backup", () => {
    expect(shouldRemind({ lastBackupAt: "2026-11-10T00:00:00.000Z" }, true, now)).toBe(false);
    expect(shouldRemind({ lastBackupAt: "2026-10-10T00:00:00.000Z" }, true, now)).toBe(true);
  });
  it("'depois' adia por 7 dias", () => {
    const until = snoozedUntil(now);
    expect(shouldRemind({ remindAfter: until }, true, now)).toBe(false);
    expect(shouldRemind({ remindAfter: until }, true, new Date(now.getTime() + 8 * 86400000))).toBe(true);
  });
});
