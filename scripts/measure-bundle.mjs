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

/** First-load JS budget for the home route, in KB gzipped. */
export const FIRST_LOAD_JS_BUDGET_KB = 150;

/** Returns an error message when the measured size is over budget, otherwise null. */
export function budgetViolation(kb, budget = FIRST_LOAD_JS_BUDGET_KB) {
  return kb > budget
    ? `first-load JS budget exceeded: ${kb} KB gzipped > ${budget} KB budget`
    : null;
}

export function writeBuildStats(outDir, target) {
  const firstLoadJsKb = measureFirstLoadJsKb(outDir);
  writeFileSync(target, JSON.stringify({ firstLoadJsKb }, null, 2) + "\n");
  return firstLoadJsKb;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const kb = writeBuildStats(join(root, "out"), join(root, "data", "build-stats.json"));
  console.log(`first-load JS: ${kb} KB gzipped (budget ${FIRST_LOAD_JS_BUDGET_KB} KB)`);
  const violation = budgetViolation(kb);
  if (violation) {
    console.error(violation);
    process.exit(1);
  }
}
