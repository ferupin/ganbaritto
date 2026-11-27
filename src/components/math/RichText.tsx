"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { speakTex, splitMath } from "@/core/math";

type Katex = typeof import("katex").default;

let loading: Promise<Katex> | null = null;
function loadKatex(): Promise<Katex> {
  loading ??= import("./katex-loader").then((m) => m.default);
  return loading;
}

function useKatex(needed: boolean): Katex | null {
  const [k, setK] = useState<Katex | null>(null);
  useEffect(() => {
    if (!needed || k) return;
    let alive = true;
    loadKatex().then((m) => alive && setK(() => m));
    return () => {
      alive = false;
    };
  }, [needed, k]);
  return k;
}

/**
 * Texto de questão com fórmulas: `$x^2$` em linha, `$$…$$` em bloco,
 * `$\ce{H2O}$` para química. Sem cifrão, devolve o texto puro, sem custo.
 * O KaTeX só é baixado quando a primeira fórmula aparece.
 */
export const RichText = memo(function RichText({ text }: { text: string }) {
  const segs = useMemo(() => (text.includes("$") ? splitMath(text) : null), [text]);
  const withMath = !!segs && segs.some((s) => s.kind === "math");
  const katex = useKatex(withMath);
  if (!segs || !withMath) return <>{text}</>;
  return (
    <>
      {segs.map((s, i) => {
        if (s.kind === "text") return <span key={i}>{s.text}</span>;
        if (!katex) {
          return (
            <span key={i} className="math-pending" role="math" aria-label={speakTex(s.tex)}>
              {s.tex}
            </span>
          );
        }
        const html = katex.renderToString(s.tex, {
          displayMode: s.display,
          throwOnError: false,
          strict: "ignore",
          output: "htmlAndMathml",
        });
        return (
          <span
            key={i}
            role="math"
            aria-label={speakTex(s.tex)}
            className={s.display ? "math-block" : undefined}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </>
  );
});
