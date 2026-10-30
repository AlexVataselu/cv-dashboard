import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** First-load JS for the home route: gzipped size of the distinct scripts in out/index.html. */
export function measureFirstLoadJsKb(outDir) {
  const html = readFileSync(join(outDir, "index.html"), "utf8");
  const srcs = new Set();
  for (const m of html.matchAll(/<script\b[^>]*?\bsrc="([^"]+)"[^>]*>/g)) {
    // nomodule scripts are legacy-browser polyfills that modern browsers never download
    if (/\bnomodule\b/i.test(m[0])) continue;
    srcs.add(m[1].split(/[?#]/)[0].replace(/^\/+/, ""));
  }
  let bytes = 0;
  for (const src of srcs) {
    if (!src.endsWith(".js")) continue;
    bytes += gzipSync(readFileSync(join(outDir, src))).length;
  }
  return Math.round((bytes / 1024) * 10) / 10;
}

export function writeBuildStats(outDir, target) {
  const firstLoadJsKb = measureFirstLoadJsKb(outDir);
  writeFileSync(target, JSON.stringify({ firstLoadJsKb }, null, 2) + "\n");
  return firstLoadJsKb;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const kb = writeBuildStats(join(root, "out"), join(root, "data", "build-stats.json"));
  console.log(`first-load JS: ${kb} KB gzipped`);
}
