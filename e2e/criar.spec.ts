import { expect, test } from "@playwright/test";

test.describe("Criar com IA", () => {
  test("nível: só o selecionado tem cor cheia", async ({ page }) => {
    await page.goto("/criar");
    const labels = page.locator('[role=radiogroup][aria-label="Nível"] label');
    const bg = (i: number) =>
      labels.nth(i).locator("span").first().evaluate((e) => getComputedStyle(e).backgroundColor);
    const checked = [0, 1, 2].filter((i) => false);
    void checked;
    let selected = -1;
    for (let i = 0; i < 3; i++) if (await labels.nth(i).locator("input").isChecked()) selected = i;
    expect(selected).toBeGreaterThanOrEqual(0);
    const others = [0, 1, 2].filter((i) => i !== selected);
    const [a, b] = [await bg(others[0]), await bg(others[1])];
    expect(a).toBe(b); // os dois apagados são iguais
    expect(await bg(selected)).not.toBe(a);
  });

  test("modo 'Sem material' muda o pedido e trava as fontes externas", async ({ page }) => {
    await page.goto("/criar");
    const modes = page.locator('[role=radiogroup][aria-label="O que você vai enviar para a IA?"] label');
    await expect(modes).toHaveText(["Imagens", "Texto", "Sem material"]);
    await modes.nth(2).click();
    const prompt = page.locator("textarea[readonly]");
    await expect(prompt).toHaveValue(/NÃO vou enviar material/);
    await expect(prompt).not.toHaveValue(/Pronto, pode enviar/);
    await expect(page.locator("input[type=checkbox][disabled]")).toHaveCount(1);
    await modes.nth(1).click();
    await expect(prompt).toHaveValue(/Pronto, pode enviar o texto\./);
  });

  test("ajuda do campo 'Número de partes' explica o conceito", async ({ page }) => {
    await page.goto("/criar");
    await page.getByRole("button", { name: /Número de partes/ }).first().hover();
    await expect(page.getByRole("tooltip")).toContainText("seções do simulado");
  });

  test("o pedido ensina LaTeX e preço em reais", async ({ page }) => {
    await page.goto("/criar");
    const v = await page.locator("textarea[readonly]").inputValue();
    expect(v).toContain("# Fórmulas e símbolos");
    expect(v).toContain("R$ 5,00");
  });
});
