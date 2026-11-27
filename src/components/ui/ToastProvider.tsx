"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { t } from "@/i18n";

/** "saved" é o aviso discreto de "salvo no navegador": menor, sem botão e sem empilhar. */
export type ToastKind = "success" | "error" | "info" | "saved";
export interface ToastOptions {
  /** Avisos com a mesma chave se substituem em vez de empilhar. */
  key?: string;
  /** Tempo na tela, em ms. */
  duration?: number;
}
type Push = (kind: ToastKind, text: string, opts?: ToastOptions) => void;

interface Item {
  id: number;
  key?: string;
  kind: ToastKind;
  text: string;
  leaving: boolean;
}

const ToastContext = createContext<Push>(() => {});

/** Aviso rápido: sobrepõe a tela no topo, nunca empurra o layout e some sozinho com fade. */
export function useToast(): Push {
  return useContext(ToastContext);
}

const FADE_MS = 220;
const DURATION: Record<ToastKind, number> = {
  success: 3200,
  info: 3200,
  error: 6000,
  saved: 3500,
};
const ICON = { success: CircleCheck, error: CircleAlert, info: Info, saved: Check } as const;
const STYLE: Record<ToastKind, string> = {
  success: "border-ok-line bg-ok-soft text-ok px-3.5 py-2.5 text-[15px] font-semibold",
  error: "border-bad-line bg-bad-soft text-bad px-3.5 py-2.5 text-[15px] font-semibold",
  info: "border-line-strong bg-paper-2 text-ink px-3.5 py-2.5 text-[15px] font-semibold",
  saved: "border-ok-line/60 bg-ok-soft/95 text-ok px-3 py-1.5 text-[13px] font-semibold",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const seq = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    // Primeiro o fade de saída; só depois o item sai da lista.
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, leaving: true } : i)));
    setTimeout(() => setItems((cur) => cur.filter((i) => i.id !== id)), FADE_MS);
  }, []);

  const push = useCallback<Push>(
    (kind, text, opts) => {
      const id = ++seq.current;
      setItems((cur) => {
        const next = opts?.key ? cur.filter((i) => i.key !== opts.key) : cur;
        // No máximo 3 avisos ao mesmo tempo.
        return [...next.slice(-2), { id, key: opts?.key, kind, text, leaving: false }];
      });
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), opts?.duration ?? DURATION[kind]),
      );
    },
    [dismiss],
  );

  const value = useMemo(() => push, [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* O "salvo" fica sozinho, colado no topo; os demais avisos começam logo abaixo. */}
      <ToastLane items={items.filter((i) => i.kind === "saved")} onDismiss={dismiss} className="top-2" />
      <ToastLane items={items.filter((i) => i.kind !== "saved")} onDismiss={dismiss} className="top-12" />
    </ToastContext.Provider>
  );
}

function ToastLane({
  items,
  onDismiss,
  className,
}: {
  items: Item[];
  onDismiss: (id: number) => void;
  className: string;
}) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-50 flex flex-col items-center gap-2 px-4 print:hidden ${className}`}
      aria-live="polite"
    >
      {items.map((i) => {
        const Icon = ICON[i.kind];
        const saved = i.kind === "saved";
        return (
          <div
            key={i.id}
            role={i.kind === "error" ? "alert" : "status"}
            data-toast={i.kind}
            className={`${i.leaving ? "toast-out" : "toast-in"} flex max-w-md items-center gap-2.5 rounded-xl border shadow-sheet ${STYLE[i.kind]} ${
              saved ? "pointer-events-none rounded-full" : "pointer-events-auto"
            }`}
          >
            <Icon size={saved ? 15 : 18} aria-hidden="true" className="flex-none" />
            <span>{i.text}</span>
            {!saved && (
              <button
                type="button"
                className="-mr-1 grid size-7 flex-none place-items-center rounded-md hover:bg-black/10"
                aria-label={t("toast.close")}
                onClick={() => onDismiss(i.id)}
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
