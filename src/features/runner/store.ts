import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";
import { newAttempt, type Attempt } from "@/storage/attempts";

export type SaveStatus = "idle" | "saved" | "error" | "off";

export interface RunnerState {
  attempt: Attempt;
  /** Já carregou a tentativa salva do navegador? Antes disso nada é gravado. */
  hydrated: boolean;
  /** Havia respostas salvas ao abrir (mostra o aviso de retomada). */
  resumed: boolean;
  save: SaveStatus;
  hydrate: (attempt: Attempt, resumed: boolean, storageOk: boolean) => void;
  setAnswer: (id: string, value: string) => void;
  setGrade: (id: string, g: { points?: number; comment?: string }) => void;
  finish: () => void;
  reset: () => void;
  setSave: (s: SaveStatus) => void;
}

function create(): StoreApi<RunnerState> {
  return createStore<RunnerState>((set) => ({
    attempt: newAttempt(),
    hydrated: false,
    resumed: false,
    save: "idle",
    hydrate: (attempt, resumed, storageOk) =>
      set({ attempt, resumed, hydrated: true, save: storageOk ? "idle" : "off" }),
    setAnswer: (id, value) =>
      set((s) => ({
        attempt: { ...s.attempt, answers: { ...s.attempt.answers, [id]: value } },
      })),
    setGrade: (id, g) =>
      set((s) => ({
        attempt: { ...s.attempt, grades: { ...s.attempt.grades, [id]: g } },
      })),
    finish: () =>
      set((s) => ({
        attempt: { ...s.attempt, finished: true, finishedAt: new Date().toISOString() },
      })),
    reset: () => set({ attempt: newAttempt(), resumed: false }),
    setSave: (save) => set({ save }),
  }));
}

/** Um store em memória por prova: trocar de prova nunca apaga o trabalho da outra. */
const stores = new Map<string, StoreApi<RunnerState>>();
export function storeFor(examId: string): StoreApi<RunnerState> {
  let s = stores.get(examId);
  if (!s) {
    s = create();
    stores.set(examId, s);
  }
  return s;
}

/** Lê uma fatia do store da prova. O componente só redesenha se a fatia mudar. */
export function useRunner<T>(examId: string, selector: (s: RunnerState) => T): T {
  return useStore(storeFor(examId), selector);
}
