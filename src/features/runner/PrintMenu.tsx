"use client";

import { BookOpen, KeyRound, Printer, ScrollText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { t } from "@/i18n";
import type { PrintMode } from "./PrintView";

/** Botão "Imprimir" com três saídas. A prova corrigida só vale depois de corrigir. */
export function PrintMenu({
  finished,
  onPick,
  onPickCorrected,
}: {
  finished: boolean;
  onPick: (m: PrintMode) => void;
  onPickCorrected: () => void;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const pick = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div className="relative" ref={box}>
      <button type="button" className="btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Printer size={18} aria-hidden="true" />
        {t("print.button")}
      </button>
      {open && (
        <div role="menu" className="absolute bottom-full left-1/2 z-20 mb-2 grid w-72 -translate-x-1/2 gap-1 rounded-xl border border-line-strong bg-paper p-1.5 shadow-sheet">
          <MenuItem icon={<BookOpen size={18} aria-hidden="true" />} title={t("print.caderno")} hint={t("print.cadernoHint")} onClick={pick(() => onPick("caderno"))} />
          <MenuItem icon={<KeyRound size={18} aria-hidden="true" />} title={t("print.gabarito")} hint={t("print.gabaritoHint")} onClick={pick(() => onPick("gabarito"))} />
          <MenuItem
            icon={<ScrollText size={18} aria-hidden="true" />}
            title={t("print.corrigida")}
            hint={finished ? t("print.corrigidaHint") : t("print.corrigidaOff")}
            disabled={!finished}
            onClick={pick(onPickCorrected)}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, title, hint, onClick, disabled }: { icon: React.ReactNode; title: string; hint: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" role="menuitem" disabled={disabled} onClick={onClick} className="flex items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-60">
      <span className="mt-0.5 flex-none text-accent-text">{icon}</span>
      <span>
        <strong className="block">{title}</strong>
        <span className="block text-[13px] text-muted">{hint}</span>
      </span>
    </button>
  );
}
