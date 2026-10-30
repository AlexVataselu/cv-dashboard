import { describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildAudit, readReports, worstScores } from "./record-audit.mjs";

const report = (p, a, b, s) => ({
  categories: {
    performance: { score: p },
    accessibility: { score: a },
    "best-practices": { score: b },
    seo: { score: s },
  },
});

describe("record-audit", () => {
  it("takes the lowest score per category across reports, as 0-100", () => {
    expect(worstScores([report(1, 1, 1, 1), report(0.97, 1, 0.92, 1)])).toEqual({
      performance: 97,
      accessibility: 100,
      bestPractices: 92,
      seo: 100,
    });
  });
  it("stamps the UTC date as YYYY-MM-DD", () => {
    const audit = buildAudit([report(1, 1, 1, 1)], new Date("2026-10-30T23:59:00Z"));
    expect(audit.date).toBe("2026-10-30");
  });
  it("reads lhr-*.json from each directory and ignores other files", () => {
    const d1 = mkdtempSync(join(tmpdir(), "lh-"));
    const d2 = mkdtempSync(join(tmpdir(), "lh-"));
    writeFileSync(join(d1, "lhr-1.json"), JSON.stringify(report(1, 1, 1, 1)));
    writeFileSync(join(d1, "manifest.json"), "[]");
    writeFileSync(join(d2, "lhr-2.json"), JSON.stringify(report(0.9, 1, 1, 1)));
    expect(readReports([d1, d2])).toHaveLength(2);
  });
  it("throws a clear error when a reports directory is missing", () => {
    const d = mkdtempSync(join(tmpdir(), "lh-"));
    mkdirSync(join(d, "ok"));
    expect(() => readReports([join(d, "nope")])).toThrow(/directory not found/);
  });
});
