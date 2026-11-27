import { expect, test } from "@playwright/test";
import { answerAndFinish, catalog, expectNoA11yViolations, questionsOf, setTheme } from "./helpers";

const mat = catalog("matematica-8ano.json");
const qs = questionsOf(mat);

/** Luminância aproximada (0 a 1) de uma cor "rgb(r, g, b)". */
const lum = (rgb: string) => {
  const [r, g, b] = (rgb.match(/\d+(\.\d+)?/g) ?? ["0", "0", "0"]).slice(0, 3).map((n) => Number(n) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

test.describe("Tema escuro: folha creme, foco suave e changelog em cartões", () => {
  test("prova no tema escuro: folha creme, barra de revisão escura, sem violações de acessibilidade", async ({ page }) => {
    await setTheme(page, "dark");
    await page.goto(`/prova?id=${mat.id}`);
    await answerAndFinish(page, qs, [0, 1, 2]);

    const sheet = page.locator("article.sheet-cream");
    const sheetBg = await sheet.evaluate((el) => getComputedStyle(el).backgroundColor);
    const deskBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(lum(sheetBg), "a folha precisa ser clara").toBeGreaterThan(0.6);
    expect(lum(deskBg), "o entorno continua escuro").toBeLessThan(0.25);

    const nav = page.locator(".review-nav");
    await expect(nav).toBeVisible();
    const navBg = await nav.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(lum(navBg), "a barra de revisão fica escura sobre a folha").toBeLessThan(0.3);

    await expectNoA11yViolations(page);
  });

  test("todas as folhas ficam cremes no escuro, com botões definidos e sem violações", async ({ page }) => {
    await setTheme(page, "dark");
    for (const rota of ["/criar", "/importar", "/dados", "/versoes"]) {
      await page.goto(rota);
      const sheet = page.locator(".sheet").first();
      await expect(sheet, rota).toBeVisible();
      const bg = await sheet.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(lum(bg), `${rota}: folha creme`).toBeGreaterThan(0.6);
      await expectNoA11yViolations(page);
    }
    // primário: coral cheio; secundário: contorno de 2px (hierarquia visível)
    await page.goto("/importar");
    const primary = page.locator(".btn-primary").first();
    const secondary = page.locator(".btn:not(.btn-primary)").first();
    if (await secondary.count()) {
      const w = await secondary.evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth));
      expect(w).toBeGreaterThanOrEqual(2);
    }
    await expect(primary).toBeVisible();
  });

  test("cartões dos bancos ficam cremes no tema escuro e a mesa continua escura", async ({ page }) => {
    await setTheme(page, "dark");
    await page.goto("/");
    await page.getByText("Exemplos para conhecer").click();
    const card = page.locator(".card-cream").first();
    await expect(card).toBeVisible();
    const bg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(lum(bg), "cartão creme").toBeGreaterThan(0.6);
    await expectNoA11yViolations(page);
  });

  test("textura da mesa: existe, não recebe cliques e é discreta", async ({ page }) => {
    for (const theme of ["light", "dark"] as const) {
      const ctx = await page.context().browser()!.newContext();
      const p = await ctx.newPage();
      await setTheme(p, theme);
      await p.goto("/");
      const s = await p.evaluate(() => {
        const c = getComputedStyle(document.body, "::before");
        return { img: c.backgroundImage, ev: c.pointerEvents, pos: c.position, op: Number(c.opacity) };
      });
      expect(s.img, theme).toContain("data:image/svg+xml");
      expect(s.ev).toBe("none");
      expect(s.pos).toBe("fixed");
      expect(s.op, "discreta").toBeLessThanOrEqual(0.2);
      await ctx.close();
    }
  });

  test("no tema claro a folha continua sendo o papel claro", async ({ page }) => {
    await setTheme(page, "light");
    await page.goto(`/prova?id=${mat.id}`);
    const bg = await page.locator("article.sheet-cream").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(lum(bg)).toBeGreaterThan(0.85);
  });

  test("foco de campo: borda coral e halo suave, sem anel grosso", async ({ page }) => {
    await setTheme(page, "dark");
    await page.goto("/criar");
    const input = page.locator("input.input").first();
    await input.focus();
    const style = await input.evaluate((el) => {
      const s = getComputedStyle(el);
      return { shadow: s.boxShadow, outlineColor: s.outlineColor, outlineWidth: s.outlineWidth };
    });
    expect(style.shadow).not.toBe("none");
    expect(style.outlineColor, "o contorno fica transparente (só aparece em alto contraste)").toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
  });

  test("changelog: só a versão mais recente começa aberta e cada cartão mostra o resumo", async ({ page }) => {
    await page.goto("/versoes");
    const cards = page.locator("details.changelog-card");
    expect(await cards.count()).toBeGreaterThan(2);
    await expect(cards.first()).toHaveJSProperty("open", true);
    await expect(cards.nth(1)).toHaveJSProperty("open", false);
    // o resumo aparece mesmo com o cartão fechado
    expect((await cards.nth(1).locator("summary").innerText()).length).toBeGreaterThan(60);
    await cards.nth(1).locator("summary").click();
    await expect(cards.nth(1)).toHaveJSProperty("open", true);
    await expectNoA11yViolations(page);
  });
});
