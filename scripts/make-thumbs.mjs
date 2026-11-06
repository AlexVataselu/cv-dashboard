// node scripts/make-thumbs.mjs
// The Projects list's thumbnails: each personal and product project's first screenshot at 240px wide,
// 16:9 from the top (a phone screen is cropped from its top), as /work/thumb-<id>-240.avif and .webp.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require("sharp");
} catch {
  const pnpm = join(process.cwd(), "node_modules/.pnpm");
  const dir = (await import("node:fs")).readdirSync(pnpm).find((d) => d.startsWith("sharp@"));
  sharp = require(join(pnpm, dir, "node_modules/sharp"));
}
const shots = JSON.parse(readFileSync("src/content/shots.json", "utf8"));
const firsts = {
  stremio: shots.stremio[0],
  powderino: shots.powderino[0],
  reamp: shots.reamp[0],
  cvdashboard: shots.cvdashboard[0],
  builderai: shots.builderai[0],
  innobyte: shots.innobyte[0],
  localsonly: shots.localsonly[0],
  eved: shots.eved[0],
};
for (const [id, s] of Object.entries(firsts)) {
  const src = join("public", `${s.image}-${s.widths.at(-1)}.webp`);
  const base = sharp(src).resize({ width: 240, height: 135, fit: "cover", position: "top" });
  await base.clone().avif({ quality: 55 }).toFile(`public/work/thumb-${id}-240.avif`);
  await base.clone().webp({ quality: 72 }).toFile(`public/work/thumb-${id}-240.webp`);
  console.log(id, "<-", src);
}
