import { describe, expect, it } from "vitest";
import { cv } from "./cv";
import { IMPACT_ROLE, careerTotals, kindOf, roleYears } from "./career";
import { deriveSkillLevel } from "./skillLevels";

// The CV was written in 2026; its headline figures must be what the dashboard computes from the roles.
const CV_YEAR = 2026;

describe("career figures add up to the CV", () => {
  it("the dated roles sum to the CV's years on the web", () => {
    expect(careerTotals(CV_YEAR).years).toBe(Number(cv.glance[0].value));
  });

  it("React, Next.js and TypeScript years match the CV's figure", () => {
    for (const id of ["react", "nextjs", "typescript"]) {
      expect(deriveSkillLevel(id, cv, CV_YEAR).years).toBe(Number(cv.glance[1].value));
    }
  });

  it("the product-team roles are the CV's two product teams", () => {
    expect(careerTotals(CV_YEAR).productTeams).toBe(Number(cv.glance[2].value));
  });

  it("the three kinds of work split the years without a gap", () => {
    const sum = (k: string) =>
      cv.roles.filter((r) => kindOf(r.id) === k).reduce((s, r) => s + roleYears(r, CV_YEAR), 0);
    expect([sum("product"), sum("indie"), sum("shop")]).toEqual([2, 3, 4]);
    expect(sum("product") + sum("indie") + sum("shop")).toBe(careerTotals(CV_YEAR).years);
  });

  it("every result names a role that states it", () => {
    for (const i of cv.impact) {
      const role = cv.roles.find((r) => r.id === IMPACT_ROLE[i.source]);
      expect(role, i.source).toBeTruthy();
      expect(role!.bullets.join(" ") + role!.company, i.source).toMatch(new RegExp(i.source.split(" / ")[0]));
    }
  });
});
