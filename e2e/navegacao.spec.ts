import { expect, test } from "@playwright/test";
import { expectNoA11yViolations, setTheme } from "./helpers";

test.describe("navegação e visual", () => {
  test("home: exemplos fechados, versões e dados no rodapé (não no topo)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("details.disclosure")).toBeVisible();
    expect(await page.locator("details.disclosure").evaluate((d: HTMLDetailsElement) => d.open)).toBe(false);
    await expect(page.locator("header").getByRole("link", { name: /Versões/ })).toHaveCount(0);
    await expect(page.locator("footer").getByRole("link", { name: /Versões e mudanças/ })).toBeVisible();
    await expect(page.locator("footer").getByRole("link", { name: "Dados e backup" })).toBeVisible();
  });

  test("abrir os exemplos mostra o catálogo por etapa", async ({ page }) => {
    await page.goto("/");
    await page.locator("details.disclosure > summary").click();
    await expect(page.getByText("Matemática").first()).toBeVisible();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`acessibilidade (axe) nas telas principais, tema ${theme}`, async ({ page }) => {
      await setTheme(page, theme);
      for (const path of ["/", "/criar", "/importar", "/dados", "/versoes"]) {
        await page.goto(path);
        await page.locator("h1").first().waitFor();
        await expectNoA11yViolations(page);
      }
    });
  }

  test("sem rolagem horizontal em 360 px", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const page = await ctx.newPage();
    for (const path of ["/", "/criar", "/importar", "/dados", "/versoes"]) {
      await page.goto(path);
      await page.locator("h1").first().waitFor();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
    }
    await ctx.close();
  });
});
