import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Every route the site serves, and the HTML file the static export writes for it. */
export const ROUTES = {
  "/": "index.html",
  "/experience": "experience.html",
  "/skills": "skills.html",
  "/projects": "projects.html",
  "/education": "education.html",
};

/** First-load JS for one route: gzipped size of the distinct scripts its HTML file references. */
export function measureFirstLoadJsKb(outDir, htmlFile = "index.html") {
  const html = readFileSync(join(outDir, htmlFile), "utf8");
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

/** First-load JS for every route, as { "/projects": 147.8, ... }. */
export function measureRoutes(outDir, routes = ROUTES) {
  return Object.fromEntries(
    Object.entries(routes).map(([route, file]) => [route, measureFirstLoadJsKb(outDir, file)]),
  );
}

/** First-load JS budget for every route, in KB gzipped. */
export const FIRST_LOAD_JS_BUDGET_KB = 150;

/** Returns an error message when the measured size is over budget, otherwise null. */
export function budgetViolation(kb, budget = FIRST_LOAD_JS_BUDGET_KB, route) {
  return kb > budget
    ? `first-load JS budget exceeded${route ? ` on ${route}` : ""}: ${kb} KB gzipped > ${budget} KB budget`
    : null;
}

/** One message per route over budget; empty when every route is within it. */
export function budgetViolations(byRoute, budget = FIRST_LOAD_JS_BUDGET_KB) {
  return Object.entries(byRoute)
    .map(([route, kb]) => budgetViolation(kb, budget, route))
    .filter((v) => v !== null);
}

/**
 * Writes data/build-stats.json. `firstLoadJsKb` (what the status bar shows) is the heaviest
 * route, so the figure is never better than the worst page; `firstLoadJsKbByRoute` has each one.
 */
export function writeBuildStats(outDir, target, routes = ROUTES) {
  const firstLoadJsKbByRoute = measureRoutes(outDir, routes);
  const firstLoadJsKb = Math.max(...Object.values(firstLoadJsKbByRoute));
  const stats = { firstLoadJsKb, firstLoadJsKbByRoute };
  writeFileSync(target, JSON.stringify(stats, null, 2) + "\n");
  return stats;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { firstLoadJsKbByRoute } = writeBuildStats(join(root, "out"), join(root, "data", "build-stats.json"));
  for (const [route, kb] of Object.entries(firstLoadJsKbByRoute)) {
    console.log(`first-load JS ${route}: ${kb} KB gzipped (budget ${FIRST_LOAD_JS_BUDGET_KB} KB)`);
  }
  const violations = budgetViolations(firstLoadJsKbByRoute);
  if (violations.length > 0) {
    for (const v of violations) console.error(v);
    process.exit(1);
  }
}
