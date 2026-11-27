import { defineConfig } from "@playwright/test";

/**
 * Testes de ponta a ponta contra o site estático (`npm run build` antes).
 * - CHROME_PATH: usa um Chrome já instalado (sem `npx playwright install`).
 * - O servidor estático sobe sozinho na porta 3111 (ou reaproveita o que já estiver lá).
 */
const chrome = process.env.CHROME_PATH;

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:3111",
    viewport: { width: 1100, height: 900 },
    locale: "pt-BR",
    launchOptions: chrome ? { executablePath: chrome, args: ["--no-sandbox"] } : {},
  },
  webServer: {
    command: "npx --yes serve@14 out -l 3111",
    url: "http://localhost:3111",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
