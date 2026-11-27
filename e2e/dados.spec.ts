import { expect, test } from "@playwright/test";
import { answerAndFinish, catalog, questionsOf } from "./helpers";

const mat = catalog("matematica-8ano.json");
const qs = questionsOf(mat);

async function seed(page: import("@playwright/test").Page) {
  // um banco próprio + uma prova corrigida (gera tentativa e histórico)
  await page.goto("/importar");
  await page.locator("textarea").fill(JSON.stringify({ ...mat, id: "meu-banco", title: "Meu banco" }));
  await page.getByRole("button", { name: /Salvar/ }).click();
  await page.goto("/prova?id=meu-banco");
  await answerAndFinish(page, qs, [1]);
  await page.waitForTimeout(600);
}

test.describe("Dados e backup", () => {
  test("lembrete aparece quando há o que perder, e 'Depois' adia", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("backup-reminder")).toHaveCount(0); // nada a perder
    await seed(page);
    await page.goto("/");
    const rem = page.getByTestId("backup-reminder");
    await expect(rem).toContainText("ainda não baixou um backup");
    await rem.getByRole("button", { name: "Depois" }).click();
    await expect(rem).toHaveCount(0);
    await page.reload();
    await expect(page.getByTestId("backup-reminder")).toHaveCount(0); // adiado por 7 dias
  });

  test("baixar, apagar tudo e restaurar (substituir) devolve banco, tentativa e histórico", async ({ page }) => {
    await seed(page);
    await page.goto("/dados");
    await expect(page.getByTestId("backup-counts")).toContainText("1 bancos");
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Baixar backup" }).click()]);
    expect(download.suggestedFilename()).toMatch(/^ganbaritto-backup-\d{4}-\d{2}-\d{2}\.json$/);
    const path = await download.path();
    await expect(page.getByTestId("backup-last")).toContainText("Último backup");

    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByTestId("backup-counts")).toContainText("0 bancos");

    await page.locator('input[type=file]').setInputFiles(path!);
    await expect(page.getByTestId("restore-preview")).toContainText("1 bancos");
    await page.getByLabel(/Substituir tudo/).check();
    await page.getByRole("button", { name: "Restaurar" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Substituir tudo" }).click();
    await expect(page.getByTestId("restore-summary")).toContainText("substituído");
    await expect(page.getByTestId("backup-counts")).toContainText("1 bancos");

    await page.goto("/prova?id=meu-banco");
    await expect(page.getByTestId("result")).toBeVisible(); // a correção voltou
  });

  test("mesclar mantém o que existe e acrescenta o que falta", async ({ page }) => {
    await seed(page);
    await page.goto("/dados");
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Baixar backup" }).click()]);
    const path = await download.path();
    // novo navegador "vazio" com um banco diferente
    await page.evaluate(() => localStorage.clear());
    await page.goto("/importar");
    await page.locator("textarea").fill(JSON.stringify({ ...mat, id: "banco-local", title: "Banco local" }));
    await page.getByRole("button", { name: /Salvar/ }).click();
    await page.goto("/dados");
    await page.locator('input[type=file]').setInputFiles(path!);
    await page.getByRole("button", { name: "Restaurar" }).click(); // mesclar é o padrão
    await expect(page.getByTestId("restore-summary")).toContainText("1 banco(s) novo(s)");
    await expect(page.getByTestId("backup-counts")).toContainText("2 bancos");
  });

  test("arquivo que não é backup é recusado sem mexer em nada", async ({ page }) => {
    await seed(page);
    await page.goto("/dados");
    await page.locator('input[type=file]').setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from('{"olá":1}') });
    await expect(page.locator(".callout[role=alert]")).toContainText("não parece um backup");
    await expect(page.getByTestId("backup-counts")).toContainText("1 bancos");
  });
});
