import { describe, expect, it } from "vitest";
import { cv } from "@/content/cv";
import {
  deriveAllSkillLevels,
  deriveSkillLevel,
  formatLevel,
  usageIndex,
} from "@/content/skillLevels";

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

describe("formatLevel", () => {
  it("uses the singular for one year", () => {
    expect(formatLevel(deriveSkillLevel("vitest", cv, YEAR))).toBe("since 2025 · 1 yr");
  });
  it("uses the plural otherwise", () => {
    expect(formatLevel(deriveSkillLevel("react", cv, YEAR))).toBe("since 2021 · 5 yrs");
  });
  it("is empty without a year", () => {
    expect(formatLevel(deriveSkillLevel("redux", cv, YEAR))).toBeUndefined();
  });
});

describe("usageIndex", () => {
  const index = usageIndex(cv);
  it("names roles by company and projects by title, up to the first comma", () => {
    expect(index.pentalog).toEqual({ id: "pentalog", kind: "role", name: "Pentalog (Globant)" });
    expect(index.tryangle.name).toBe("TryAngle Labs");
    expect(index.powderino).toEqual({ id: "powderino", kind: "project", name: "Powderino" });
  });
  it("tells repeated names apart by start year", () => {
    expect(index["freelance-2025"].name).toBe("Freelance 2025");
    expect(index["freelance-2021"].name).toBe("Freelance 2021");
  });
});
