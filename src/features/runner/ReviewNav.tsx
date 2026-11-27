"use client";

import { ChevronDown, ChevronUp, ListChecks } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Exam } from "@/core/schema";
import { allQuestions, reviewTargets } from "@/core/score";
import { t } from "@/i18n";
import { useRunner } from "./store";

// Um pouco mais que a animação (2,8 s), para ela terminar sozinha antes de o atributo sair.
const FLASH_MS = 3000;

/**
 * Depois da correção: leva, em ordem, às questões a rever (erradas, em branco
 * ou com nota baixa) e destaca a questão por um instante. Só aparece com a
 * prova corrigida e se houver algo a rever.
 */
export function ReviewNav({ exam }: { exam: Exam }) {
  const answers = useRunner(exam.id, (s) => s.attempt.answers);
  const grades = useRunner(exam.id, (s) => s.attempt.grades);
  const targets = useMemo(() => reviewTargets(exam, answers, grades), [exam, answers, grades]);
  const numberOf = useMemo(() => {
    const m = new Map<string, number>();
    allQuestions(exam).forEach((q, i) => m.set(q.id, i + 1));
    return m;
  }, [exam]);

  const [index, setIndex] = useState(-1);
  const [announce, setAnnounce] = useState("");
  const timer = useRef<number>(0);
  const last = useRef<Element | null>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  // Se a lista encolher (nota nova), não deixa o índice apontar para o vazio.
  useEffect(() => {
    if (index >= targets.length) setIndex(targets.length - 1);
  }, [targets.length, index]);

  const go = useCallback(
    (to: number) => {
      if (targets.length === 0) return;
      const i = (to + targets.length) % targets.length;
      const id = targets[i];
      const el = document.querySelector<HTMLElement>(`[data-qid="${CSS.escape(id)}"]`);
      if (!el) return;
      setIndex(i);
      last.current?.removeAttribute("data-flash");
      window.clearTimeout(timer.current);
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "center" });
      el.focus({ preventScroll: true });
      el.setAttribute("data-flash", "on");
      last.current = el;
      timer.current = window.setTimeout(() => el.removeAttribute("data-flash"), FLASH_MS);
      setAnnounce(t("review.announce", { number: numberOf.get(id) ?? 0, n: i + 1, total: targets.length }));
    },
    [targets, numberOf],
  );

  if (targets.length === 0) return null;

  return (
    <div
      className="review-nav on-dark"
      role="group"
      aria-label={t("review.label")}
    >
      <ListChecks size={18} className="hidden flex-none text-warm sm:block" aria-hidden="true" />
      {index < 0 ? (
        <button type="button" className="btn btn-primary btn-sm flex-1 sm:flex-none" onClick={() => go(0)}>
          {t("review.start", { total: targets.length })}
        </button>
      ) : (
        <>
          <span className="flex-1 whitespace-nowrap text-center text-sm font-bold sm:flex-none sm:px-2">
            {t("review.status", { n: index + 1, total: targets.length })}
          </span>
          <button type="button" className="btn btn-sm" onClick={() => go(index - 1)} aria-label={t("review.prev")}>
            <ChevronUp size={16} aria-hidden="true" />
            <span className="max-sm:sr-only">{t("review.prev")}</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => go(index + 1)} aria-label={t("review.next")}>
            <ChevronDown size={16} aria-hidden="true" />
            <span className="max-sm:sr-only">{t("review.next")}</span>
          </button>
        </>
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {announce}
      </span>
    </div>
  );
}
