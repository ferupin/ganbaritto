/** Linhas de escrita no caderno para uma discursiva, conforme a pontuação máxima. */
export function answerLines(maxPoints: number): number {
  return Math.min(14, Math.max(6, 4 + maxPoints * 2));
}

/** Pares "número → letra" do gabarito das objetivas, na ordem da prova. */
export function answerKey(
  questions: { id: string; type: string; options?: { id: string }[]; answer?: string }[],
): { number: number; letter: string }[] {
  const out: { number: number; letter: string }[] = [];
  questions.forEach((q, i) => {
    if (q.type !== "multiple_choice" || !q.options) return;
    const idx = q.options.findIndex((o) => o.id === q.answer);
    if (idx >= 0) out.push({ number: i + 1, letter: String.fromCharCode(65 + idx) });
  });
  return out;
}
