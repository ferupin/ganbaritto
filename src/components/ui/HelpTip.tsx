"use client";

import { CircleHelp } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";

/**
 * Ícone "?" com explicação. Abre ao passar o mouse, ao focar com o teclado
 * ou ao tocar (no celular); Esc fecha. O texto vem ligado ao botão por
 * aria-describedby. O balão se posiciona em relação ao campo (pai com
 * `relative`) e nunca passa da largura dele em telas pequenas.
 */
export function HelpTip({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hover || focus || pinned;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHover(false);
        setFocus(false);
        setPinned(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        className="grid size-7 flex-none place-items-center rounded-full text-muted transition-colors hover:text-accent-text"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setFocus(false);
          setPinned(false);
        }}
        onClick={() => setPinned((p) => !p)}
      >
        <CircleHelp size={17} aria-hidden="true" />
      </button>
      {open && (
        <div
          id={id}
          role="tooltip"
          className="toast-in on-dark absolute inset-x-0 top-full z-20 mt-1 rounded-xl border border-line-strong bg-paper p-3.5 text-sm leading-relaxed text-ink shadow-sheet sm:right-auto sm:w-[22rem]"
        >
          {children}
        </div>
      )}
    </>
  );
}
