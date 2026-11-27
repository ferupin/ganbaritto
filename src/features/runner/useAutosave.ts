"use client";

import { useEffect } from "react";
import { saveAttempt } from "@/storage/attempts";
import { storeFor } from "./store";

/**
 * Grava a tentativa no navegador pouco depois de cada mudança (sem gravar
 * a cada tecla) e garante que nada se perde se a aba for fechada ou trocada
 * dentro desse intervalo.
 */
export function useAutosave(examId: string): void {
  useEffect(() => {
    const store = storeFor(examId);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let dirty = false;

    const write = () => {
      const s = store.getState();
      if (!s.hydrated || s.save === "off") return;
      dirty = false;
      s.setSave(saveAttempt(examId, s.attempt) ? "saved" : "error");
    };

    const unsub = store.subscribe((s, prev) => {
      if (!s.hydrated || s.save === "off" || s.attempt === prev.attempt) return;
      dirty = true;
      clearTimeout(timer);
      timer = setTimeout(write, 250);
    });

    const flush = () => {
      clearTimeout(timer);
      if (dirty) write();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      unsub();
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      flush();
    };
  }, [examId]);
}
