import { describe, expect, it } from "vitest";
import { buildAudit, worstScores } from "./record-audit.mjs";

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
});
