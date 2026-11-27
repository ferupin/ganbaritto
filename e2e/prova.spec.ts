import { expect, test } from "@playwright/test";
import { answerAndFinish, catalog, expectNoA11yViolations, questionsOf } from "./helpers";

const mat = catalog("matematica-8ano.json");
const qs = questionsOf(mat);
const url = `/prova?id=${mat.id}`;

test.describe("Prova com fórmulas, revisão e topo", () => {
  test("fórmulas viram KaTeX, sem cifrões crus, e preço continua texto", async ({ page }) => {
    await page.goto(url);
    await expect(page.locator(".katex").first()).toBeVisible();
    expect(await page.locator(".katex").count()).toBeGreaterThanOrEqual(5);
    const text = await page.locator("article").innerText();
    expect(text.replace(/R\$/g, "")).not.toContain("$");
    expect(text).toContain("R$ 80,00");
    expect(await page.evaluate(() => document.fonts.check("16px KaTeX_Main"))).toBe(true);
    await expectNoA11yViolations(page);
  });

  test("retomada: recarregar mantém as respostas", async ({ page }) => {
    await page.goto(url);
    const q = qs[0];
    await page.locator(`input[name="${q.id}"][value="${q.answer}"]`).check({ force: true });
    await page.waitForTimeout(800);
    await page.reload();
    await expect(page.locator(`input[name="${q.id}"][value="${q.answer}"]`)).toBeChecked();
  });

  test("revisão: avança pelas erradas em ordem, destaca, dá a volta e o destaque some", async ({ page }) => {
    await page.goto(url);
    await answerAndFinish(page, qs, [0, 2, 5, 8]);
    const nav = page.locator(".review-nav");
    await expect(nav).toContainText("Revisar 4 questões");
    await nav.getByRole("button", { name: /Revisar/ }).click();
    const flash = page.locator('.question[data-flash="on"]');
    await expect(flash).toHaveAttribute("data-qid", qs[0].id);
    await expect(nav).toContainText("1 de 4");
    await nav.getByRole("button", { name: "Próxima" }).click();
    await expect(flash).toHaveAttribute("data-qid", qs[2].id);
    await nav.getByRole("button", { name: "Anterior" }).click();
    await nav.getByRole("button", { name: "Anterior" }).click();
    await expect(flash).toHaveAttribute("data-qid", qs[8].id); // circular
    await expect(nav).toContainText("4 de 4");
    await expect(page.locator('.question[data-flash="on"]')).toHaveCount(0, { timeout: 5000 });
  });

  test("o destaque se dissolve aos poucos (fade-out), não some de repente", async ({ page }) => {
    await page.goto(url);
    await answerAndFinish(page, qs, [0]);
    await page.locator(".review-nav").getByRole("button", { name: /Revisar/ }).click();
    const bg = () => page.locator(`[data-qid="${qs[0].id}"]`).evaluate((e) => getComputedStyle(e).backgroundColor);
    const seen = new Set<string>();
    for (let i = 0; i < 3; i++) {
      seen.add(await bg());
      await page.waitForTimeout(1000);
    }
    expect(seen.size).toBe(3);
  });

  test("botão de topo aparece ao rolar e leva ao cabeçalho", async ({ page }) => {
    await page.goto(url);
    const top = page.locator(".scroll-top");
    await expect(top).toHaveAttribute("data-show", "false");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(top).toHaveAttribute("data-show", "true");
    await top.click();
    // a rolagem suave demora mais quando vários testes rodam juntos
    await expect.poll(() => page.evaluate(() => scrollY), { timeout: 15_000 }).toBeLessThan(5);
    await expect(top).toHaveAttribute("data-show", "false", { timeout: 10_000 });
  });

  test("em 360 px, revisão e topo não se sobrepõem", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const page = await ctx.newPage();
    await page.goto(url);
    await answerAndFinish(page, qs, [0, 3]);
    await page.locator(".review-nav").getByRole("button", { name: /Revisar/ }).click();
    await page.waitForTimeout(700);
    const n = (await page.locator(".review-nav").boundingBox())!;
    const t = (await page.locator(".scroll-top").boundingBox())!;
    expect(n.x + n.width).toBeLessThanOrEqual(t.x + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await ctx.close();
  });
});
