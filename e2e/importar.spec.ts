import { expect, test } from "@playwright/test";
import { catalog, questionsOf } from "./helpers";

const mat = catalog("matematica-8ano.json");

test.describe("Importar", () => {
  test("dois passos com divisor 'ou' e ajudantes de colagem", async ({ page }) => {
    await page.goto("/importar");
    await expect(page.locator(".step-dot")).toHaveCount(2);
    await expect(page.locator(".or-divider")).toHaveCount(1);
    await page.locator("textarea").fill("{ qualquer coisa");
    await page.getByRole("button", { name: "Limpar" }).click();
    await expect(page.locator("textarea")).toHaveValue("");
  });

  test("recusa barra invertida de LaTeX não dobrada e explica", async ({ page }) => {
    await page.goto("/importar");
    const bad = JSON.stringify({ ...mat, id: "t-barra" }).replace("\\\\times", "\\times").replace("\\\\frac", "\\frac");
    await page.locator("textarea").fill(bad);
    await expect(page.locator(".callout[role=alert]")).toContainText("barra invertida");
  });

  test("pré-visualização mostra números, letras e o gabarito marcado antes de salvar", async ({ page }) => {
    await page.goto("/importar");
    await page.locator("textarea").fill(JSON.stringify(mat));
    const prev = page.getByTestId("exam-preview");
    await expect(prev).toBeVisible();
    await expect(prev).toContainText("Gabarito por letra");
    await prev.locator("details > summary").click();
    const qs = questionsOf(mat);
    await expect(page.getByTestId("preview-question")).toHaveCount(qs.length);
    // a alternativa correta da 1ª questão está marcada
    const first = page.getByTestId("preview-question").first();
    await expect(first.locator('li[data-correct="true"]')).toHaveCount(1);
    await expect(first.locator('li[data-correct="true"] span').first()).toHaveText(qs[0].answer!.toUpperCase());
    // nada foi salvo só por visualizar
    expect(await page.evaluate(() => localStorage.getItem("examgen.v1.library"))).toBeNull();
    await page.getByRole("button", { name: /Salvar/ }).click();
    await expect(page.getByText("Salvo na biblioteca").first()).toBeVisible();
  });
});
