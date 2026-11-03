// Look-loop screenshots (not part of the build): every route at the given sizes in both themes.
// usage: node scripts/shots.mjs <outDir> [baseUrl] [sizes e.g. 1440x900,1280x720,390x844]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "shots";
const base = process.argv[3] ?? "http://localhost:4319";
const sizes = (process.argv[4] ?? "1440x900,1366x768,1280x720,390x844").split(",").map((s) => s.split("x").map(Number));
const routes = { overview: "/", experience: "/experience", skills: "/skills", projects: "/projects", education: "/education" };
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const theme of ["light", "dark"]) {
  for (const [w, h] of sizes) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, colorScheme: theme });
    for (const [name, path] of Object.entries(routes)) {
      await page.goto(base + path);
      await page.waitForTimeout(1600);
      const m = await page.evaluate(() => {
        const main = document.getElementById("main");
        return {
          doc: document.documentElement.scrollHeight - innerHeight,
          main: main ? main.scrollHeight - main.clientHeight : 0,
        };
      });
      console.log(`${theme} ${w}x${h} ${name}: doc overflow ${m.doc}, main overflow ${m.main}`);
      await page.screenshot({ path: `${out}/${name}-${theme}-${w}x${h}.png`, fullPage: w < 1024 });
    }
    await page.close();
  }
}
await browser.close();
