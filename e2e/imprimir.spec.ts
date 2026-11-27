import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { catalog, questionsOf } from "./helpers";

const cie = catalog("ciencias-4ano.json");
const qs = questionsOf(cie);

test.describe("Impressão", () => {
  // Em navegadores sem tela (headless), window.print() dispara "afterprint" na hora e o app
  // volta para a tela normal antes do PDF ser gerado. Aqui o print é neutralizado para o
  // estado do papel ficar estável; quem gera o PDF é o próprio teste (page.pdf).
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.print = () => {};
    });
  });

  for (const [label, mode] of [["Caderno de prova", "caderno"], ["Gabarito", "gabarito"]] as const) {
    test(`${mode}: folha própria, conteúdo certo e PDF válido`, async ({ page }) => {
      await page.goto(`/prova?id=${cie.id}`);
      await page.getByRole("button", { name: "Imprimir" }).click();
      await page.getByRole("menuitem", { name: new RegExp(`^${label}`) }).click();
      await page.emulateMedia({ media: "print" });
      const sheet = page.locator(`[data-print-mode="${mode}"]`);
      await expect(sheet).toBeVisible();
      await expect(page.locator("article.sheet")).toBeHidden(); // a tela interativa não vai ao papel
      const text = await sheet.innerText();
      if (mode === "caderno") {
        expect(text).toContain("Nome:");
        expect(text).not.toMatch(/Resposta:|Gabarito/);
        expect(await sheet.locator(".print-line").count()).toBeGreaterThanOrEqual(6); // linhas da discursiva
        expect(await sheet.locator(".print-bubble").count()).toBe(qs.filter((q) => q.type === "multiple_choice").length * 4);
      } else {
        expect(text).toContain("Gabarito:");
        expect(text).toContain("Resposta:");
        expect(await sheet.locator(".print-key span").count()).toBe(qs.filter((q) => q.type === "multiple_choice").length);
      }
      // fundo branco no papel (não o bege da tela); espera a transição de cor do tema terminar
      await page.waitForTimeout(500);
      expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(255, 255, 255)");
      await expect(sheet, "a folha de papel precisa continuar na tela até o PDF sair").toBeVisible();
      const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
      expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
      // guarda o PDF para abrir e olhar quando um teste falhar
      mkdirSync("test-results", { recursive: true });
      writeFileSync(`test-results/impressao-${mode}.pdf`, pdf);
      const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
      expect(pages, `páginas do ${mode} (veja test-results/impressao-${mode}.pdf)`).toBeGreaterThanOrEqual(1);
      expect(pages, `páginas do ${mode} (veja test-results/impressao-${mode}.pdf)`).toBeLessThanOrEqual(3);
    });
  }

  test("'Prova corrigida' fica desligada até corrigir", async ({ page }) => {
    await page.goto(`/prova?id=${cie.id}`);
    await page.getByRole("button", { name: "Imprimir" }).click();
    await expect(page.getByRole("menuitem", { name: /^Prova corrigida/ })).toBeDisabled();
  });
});
