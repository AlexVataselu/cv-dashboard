import { describe, expect, it } from "vitest";
import { cv } from "./cv";
import { FIRST_YEAR, IMPACT_ROLE, KINDS, careerTotals, kindYears, roleEnd } from "./career";
import { deriveSkillLevel } from "./skillLevels";

// The CV's year (cv.asOf); its headline figures must be what the dashboard computes from the roles.
const CV_YEAR = cv.asOf;

describe("career figures add up to the CV", () => {
  it("the CV's year is 2026 and is the default for every count", () => {
    expect(cv.asOf).toBe(2026);
    expect(careerTotals()).toEqual(careerTotals(2026));
  });

  it("the dated roles cover the CV's 14 years building software, 2012 to 2026", () => {
    expect(FIRST_YEAR).toBe(2012);
    expect(CV_YEAR - FIRST_YEAR).toBe(14);
    expect(careerTotals(CV_YEAR).years).toBe(14);
    expect(careerTotals(CV_YEAR).years).toBe(Number(cv.glance[0].value));
    expect(cv.glance[0].label).toBe("years building software");
  });

  it("the dated roles are contiguous: each starts at or before the end of the one before it", () => {
    const byStart = [...cv.roles].sort((a, b) => a.start - b.start);
    expect(byStart[0].start).toBe(FIRST_YEAR);
    let reach = roleEnd(byStart[0], CV_YEAR);
    for (const r of byStart.slice(1)) {
      expect(r.start, `${r.id} starts after a gap`).toBeLessThanOrEqual(reach);
      reach = Math.max(reach, roleEnd(r, CV_YEAR));
    }
    expect(reach).toBe(CV_YEAR);
    // newest first, as the CV lists them, with no year missing between neighbours
    for (let i = 1; i < cv.roles.length; i++) {
      expect(cv.roles[i].start, cv.roles[i].id).toBeLessThanOrEqual(roleEnd(cv.roles[i - 1], CV_YEAR));
      expect(roleEnd(cv.roles[i], CV_YEAR), cv.roles[i].id).toBeGreaterThanOrEqual(cv.roles[i - 1].start);
    }
  });

  it("React and Next.js years match the CV's figure", () => {
    for (const id of ["react", "nextjs"]) {
      expect(deriveSkillLevel(id, cv, CV_YEAR).years).toBe(Number(cv.glance[1].value));
    }
  });

  it("TypeScript is dated from L.H.EL (Superland), 2017, by the same rule", () => {
    expect(deriveSkillLevel("typescript", cv, CV_YEAR)).toMatchObject({ since: 2017, until: null, years: 9 });
  });

  it("the product-team roles are the CV's two product teams", () => {
    expect(careerTotals(CV_YEAR).productTeams).toBe(Number(cv.glance[2].value));
  });

  it("the four kinds of work, less the years run side by side, add up to the total", () => {
    expect(KINDS.map((k) => kindYears(k, CV_YEAR))).toEqual([4, 3, 4, 5]);
    const { years, overlap } = careerTotals(CV_YEAR);
    expect(overlap).toBe(2); // TryAngle Labs beside the 2021 freelance work, 2021 to 2023
    expect(KINDS.reduce((s, k) => s + kindYears(k, CV_YEAR), 0) - overlap).toBe(years);
  });

  it("every result names a role that states it", () => {
    for (const i of cv.impact) {
      const role = cv.roles.find((r) => r.id === IMPACT_ROLE[i.source]);
      expect(role, i.source).toBeTruthy();
      expect(role!.bullets.join(" ") + role!.company, i.source).toMatch(new RegExp(i.source.split(" / ")[0]));
    }
  });
});
