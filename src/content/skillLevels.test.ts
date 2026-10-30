import { describe, expect, it } from "vitest";
import { cv } from "@/content/cv";
import { deriveAllSkillLevels, deriveSkillLevel } from "@/content/skillLevels";

const YEAR = 2026;

describe("deriveSkillLevel", () => {
  it.each(["react", "nextjs", "typescript"])("%s since 2021, 5 years", (id) => {
    const l = deriveSkillLevel(id, cv, YEAR);
    expect(l.since).toBe(2021);
    expect(l.years).toBe(5);
  });

  it.each(["graphql", "prisma", "postgresql", "firebase", "wcag"])(
    "%s since 2021",
    (id) => expect(deriveSkillLevel(id, cv, YEAR).since).toBe(2021),
  );

  it.each(["react-native", "expo", "tailwind", "github-actions", "vercel"])(
    "%s since 2023",
    (id) => expect(deriveSkillLevel(id, cv, YEAR).since).toBe(2023),
  );

  it("sentry since 2024", () => {
    expect(deriveSkillLevel("sentry", cv, YEAR).since).toBe(2024);
  });

  it.each(["vitest", "playwright", "axe-core"])("%s since 2025", (id) =>
    expect(deriveSkillLevel(id, cv, YEAR).since).toBe(2025),
  );

  it.each(["html", "css", "javascript"])("%s implied since 2017", (id) =>
    expect(deriveSkillLevel(id, cv, YEAR).since).toBe(2017),
  );

  it.each(["jest", "nodejs", "tanstack-query"])(
    "%s has only current-year evidence",
    (id) => {
      const l = deriveSkillLevel(id, cv, YEAR);
      expect(l.since).toBeNull();
      expect(l.years).toBeNull();
    },
  );

  it.each([
    "redux",
    "zustand",
    "storybook",
    "supabase",
    "rest",
    "tdd",
    "git",
  ])("%s since null", (id) =>
    expect(deriveSkillLevel(id, cv, YEAR).since).toBeNull(),
  );

  // Brief said figma => null, but cv.ts lists figma on tryangle (2023).
  it("figma since 2023 (tryangle evidence)", () => {
    expect(deriveSkillLevel("figma", cv, YEAR).since).toBe(2023);
  });

  it("react usedIn contains pentalog and tryangle", () => {
    const { usedIn } = deriveSkillLevel("react", cv, YEAR);
    expect(usedIn).toContain("pentalog");
    expect(usedIn).toContain("tryangle");
  });

  it("derives all skills", () => {
    const all = deriveAllSkillLevels(cv, YEAR);
    expect(Object.keys(all)).toHaveLength(cv.skills.length);
    expect(all.react.skillId).toBe("react");
  });
});
