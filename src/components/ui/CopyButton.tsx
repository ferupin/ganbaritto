"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { t } from "@/i18n";
import { useToast } from "./ToastProvider";

/** Copiar: o ícone vira um "ok" por dois segundos, igual em todo o app. */
export function CopyButton({
  text,
  label,
  successMessage,
  primary = true,
  beforeCopy,
}: {
  text: string;
  label: string;
  successMessage: string;
  primary?: boolean;
  /** Pode barrar a cópia (ex.: campos obrigatórios vazios). Devolva false para barrar. */
  beforeCopy?: () => boolean;
}) {
  const [done, setDone] = useState(false);
  const toast = useToast();

  async function copy() {
    if (beforeCopy && !beforeCopy()) return;
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      toast("success", successMessage);
      setTimeout(() => setDone(false), 2000);
    } catch {
      toast("error", t("toast.copyFailed"));
    }
  }

  return (
    <button
      type="button"
      className={`btn ${primary ? "btn-primary" : ""}`}
      onClick={copy}
    >
      {done ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
      {done ? t("common.copied") : label}
    </button>
  );
}
