"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { t } from "@/i18n";

export interface ConfirmOptions {
  title: string;
  body: string;
  confirmLabel?: string;
  /** Ação destrutiva: o botão de confirmar fica em tom de alerta. */
  danger?: boolean;
}
type Confirm = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm>(() => Promise.resolve(false));

/** Pede confirmação num modal acessível. Devolve true ao confirmar. */
export function useConfirm(): Confirm {
  return useContext(ConfirmContext);
}

/**
 * Modal nativo <dialog>: o navegador cuida do foco preso e do Escape.
 * Marca <html data-modal-open> para o CSS desfocar a página atrás.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  const confirm = useCallback<Confirm>((o) => {
    return new Promise<boolean>((resolve) => {
      resolver.current?.(false);
      resolver.current = resolve;
      setOpts(o);
    });
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d || !opts) return;
    if (!d.open) d.showModal();
    document.documentElement.setAttribute("data-modal-open", "");
  }, [opts]);

  function close(result: boolean) {
    ref.current?.close();
    document.documentElement.removeAttribute("data-modal-open");
    resolver.current?.(result);
    resolver.current = null;
    setOpts(null);
  }

  const value = useMemo(() => confirm, [confirm]);
  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <dialog
        ref={ref}
        className="modal"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        // Escape fecha o <dialog>; tratamos como "cancelar".
        onCancel={(e) => {
          e.preventDefault();
          close(false);
        }}
        onClick={(e) => {
          if (e.target === ref.current) close(false);
        }}
      >
        {opts && (
          <div className="grid gap-4 p-5 sm:p-6">
            <h2 id="confirm-title" className="text-xl font-bold">
              {opts.title}
            </h2>
            <p id="confirm-body" className="text-muted">
              {opts.body}
            </p>
            <div className="flex flex-wrap justify-end gap-2.5">
              <button type="button" className="btn" onClick={() => close(false)} autoFocus>
                {t("modal.cancel")}
              </button>
              <button
                type="button"
                className={`btn ${opts.danger ? "btn-danger" : "btn-primary"}`}
                onClick={() => close(true)}
                data-confirm
              >
                {opts.confirmLabel ?? t("modal.confirm")}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </ConfirmContext.Provider>
  );
}
