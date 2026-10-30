import { defineConfig, devices } from "@playwright/test";

// A less common port so a dev server on 3000 is never tested by mistake.
const PORT = 4317;

// Serves the static export in out/. Run `pnpm build` first (the `e2e` script does).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec serve out -l ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
