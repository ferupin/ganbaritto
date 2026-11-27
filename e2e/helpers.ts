import { expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const catalog = (file: string) =>
  JSON.parse(readFileSync(join(process.cwd(), "src/exams/catalog", file), "utf8"));

type Q = { id: string; type: string; answer?: string; options?: { id: string }[] };
export const questionsOf = (exam: { parts: { questions: Q[] }[] }): Q[] => exam.parts.flatMap((p) => p.questions);

/** Falha o teste se o axe achar violação WCAG A/AA na página atual. */
export async function expectNoA11yViolations(page: Page) {
  await page.waitForTimeout(500); // deixa transições de cor terminarem
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const found = await page.evaluate(async () => {
    // @ts-expect-error axe vem do script injetado
    const r = await axe.run(document, { runOnly: ["wcag2a", "wcag2aa"] });
    return r.violations.map((v: any) => `${v.id}: ${v.nodes.length} (${v.nodes[0].target.join(" ")})`);
  });
  expect(found, "violações de acessibilidade").toEqual([]);
}

export const setTheme = (page: Page, theme: "light" | "dark") =>
  page.addInitScript((th) => localStorage.setItem("examgen.v1.theme", th), theme);

/** Marca as respostas certas (ou erra as posições em `wrong`) e finaliza a prova. */
export async function answerAndFinish(page: Page, qs: Q[], wrong: number[] = []) {
  for (const [i, q] of qs.entries()) {
    if (q.type !== "multiple_choice") continue;
    const pick = wrong.includes(i) ? q.options!.find((o) => o.id !== q.answer)!.id : q.answer!;
    await page.locator(`input[name="${q.id}"][value="${pick}"]`).check({ force: true });
  }
  await page.getByRole("button", { name: "Finalizar e corrigir" }).click();
  await page.getByTestId("result").waitFor();
}
