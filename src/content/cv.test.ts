import { describe, expect, it } from "vitest";
import { cv } from "./cv";

describe("cv content", () => {
  it("about is the CV profile paragraph", () => {
    expect(cv.about).toBe(
      "9 years building for the web, the last five focused on React, Next.js, TypeScript, and React Native. I've shipped products in healthcare, fintech, and cultural heritage, on product teams at Pentalog and TryAngle Labs, and as an independent contractor covering design and development end to end. My daily workflow is AI-assisted (Claude Code with Figma and GitHub), but every branch still gets tests and review before it ships.",
    );
    expect(cv.about.startsWith("9 years building for the web")).toBe(true);
    for (const bad of ["—", "Globant", "Builder.ai", "Supabase", "Vercel"]) {
      expect(cv.about).not.toContain(bad);
    }
  });

  it("glance values", () => {
    expect(cv.glance.map((g) => g.value)).toEqual(["9", "5", "2", "3"]);
  });

  it("impact stats have sources", () => {
    const values = cv.impact.map((i) => i.value);
    for (const v of ["4→2", "−40%", "−35%", "+28%"]) expect(values).toContain(v);
    for (const i of cv.impact) expect(i.source).not.toBe("");
  });

  it("roles are newest first", () => {
    expect(cv.roles.map((r) => r.start)).toEqual([2025, 2024, 2023, 2021, 2017]);
    const lhel = cv.roles.find((r) => r.id === "lhel")!;
    expect(lhel.start).toBe(2017);
    expect(lhel.end).toBe(2021);
  });

  it("has no phone number", () => {
    expect(JSON.stringify(cv)).not.toMatch(/\+40|767/);
  });

  it("links", () => {
    expect(cv.links.linkedin).toBe("https://linkedin.com/in/alex-vataselu");
    expect(cv.links.github).toBe("https://github.com/AlexVataselu");
    expect(cv.links.pdf).toBe("/CV_AlexVataselu.pdf");
  });

  it("every skillId exists", () => {
    const ids = new Set(cv.skills.map((s) => s.id));
    for (const x of [...cv.roles, ...cv.projects]) {
      for (const id of x.skillIds) expect(ids.has(id), id).toBe(true);
    }
  });

  it("education has no years", () => {
    for (const e of cv.education) {
      expect(`${e.degree} ${e.school}`).not.toMatch(/\d{4}/);
    }
  });
});
