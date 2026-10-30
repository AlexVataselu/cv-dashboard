import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const CATEGORIES = {
  performance: "performance",
  accessibility: "accessibility",
  bestPractices: "best-practices",
  seo: "seo",
};

/** Worst (lowest) score per category across all Lighthouse reports, as 0-100 integers. */
export function worstScores(reports) {
  const scores = {};
  for (const [key, id] of Object.entries(CATEGORIES)) {
    const values = reports.map((r) => Math.round(r.categories[id].score * 100));
    scores[key] = Math.min(...values);
  }
  return scores;
}

export function buildAudit(reports, now = new Date()) {
  return { date: now.toISOString().slice(0, 10), scores: worstScores(reports) };
}

export function readReports(dirs) {
  const reports = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) throw new Error(`Lighthouse reports directory not found: ${dir}`);
    for (const f of readdirSync(dir)) {
      if (/^lhr-.*\.json$/.test(f)) reports.push(JSON.parse(readFileSync(join(dir, f), "utf8")));
    }
  }
  return reports;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dirs = process.argv.slice(2);
  let reports;
  try {
    reports = readReports(dirs);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  if (reports.length === 0) {
    console.error("no Lighthouse reports found in: " + dirs.join(", "));
    process.exit(1);
  }
  const audit = buildAudit(reports);
  writeFileSync(join(root, "data", "last-audit.json"), JSON.stringify(audit) + "\n");
  console.log("recorded", JSON.stringify(audit));
}
