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
    "%s since 2021 (TryAngle Labs)",
    (id) => expect(deriveSkillLevel(id, cv, YEAR).since).toBe(2021),
  );

  it("react native's years match the CV's five years", () => {
    expect(deriveSkillLevel("react-native", cv, YEAR).years).toBe(5);
  });

  it.each(["aspnet-mvc", "csharp", "jquery", "mysql"])(
    "%s shows its real span, 2013–2017 at Zega Software, not years to now",
    (id) => {
      const l = deriveSkillLevel(id, cv, YEAR);
      expect(l).toMatchObject({ since: 2013, until: 2017, years: 4, usedIn: ["zega"] });
      expect(formatLevel(l)).toBe("2013–2017 · 4 yrs");
    },
  );

  it("php lists both spans the CV dates it in, with the years actually covered", () => {
    const l = deriveSkillLevel("php", cv, YEAR);
    expect(l).toMatchObject({ since: 2013, until: 2023, years: 6, usedIn: ["freelance-2021", "zega"] });
    expect(formatLevel(l)).toBe("2013–2017, 2021–2023 · 6 yrs");
  });

  it("a skill still in use keeps since and years to the CV's year", () => {
    for (const id of ["react", "react-native", "html", "wcag"]) {
      const l = deriveSkillLevel(id, cv, YEAR);
      expect(l.until, id).toBeNull();
      expect(formatLevel(l), id).toMatch(/^since \d{4} · \d+ yrs?$/);
    }
  });

  it.each(["tailwind", "github-actions", "sentry", "sonarqube", "graphql", "postgresql", "firebase", "wcag"])(
    "%s, dated from 2021 on with no break over a year, reads since",
    (id) => {
      const l = deriveSkillLevel(id, cv, YEAR);
      expect(l.until).toBeNull();
      expect(formatLevel(l)).toMatch(/^since 20(2[1-5]) · \d+ yrs?$/);
    },
  );

  it("every skill first dated from 2021 on reads since", () => {
    for (const s of cv.skills) {
      const l = deriveSkillLevel(s.id, cv, YEAR);
      if (l.since != null && l.since >= 2021) expect(formatLevel(l), s.id).toMatch(/^since /);
    }
  });

  it("past skills stay past in a later build year, with the same span", () => {
    expect(formatLevel(deriveSkillLevel("csharp", cv, 2031))).toBe("2013–2017 · 4 yrs");
  });

  it.each(["sonarqube", "sentry"])("%s since 2024 (Pentalog)", (id) => {
    expect(formatLevel(deriveSkillLevel(id, cv, YEAR))).toBe("since 2024 · 2 yrs");
  });

  it("sentry since 2024", () => {
    expect(deriveSkillLevel("sentry", cv, YEAR).since).toBe(2024);
  });

  it.each(["vitest", "playwright", "axe-core"])("%s since 2025", (id) =>
    expect(deriveSkillLevel(id, cv, YEAR).since).toBe(2025),
  );

  it.each(["html", "css", "javascript"])("%s implied since 2012 (Kemblimed, web developer)", (id) =>
    expect(deriveSkillLevel(id, cv, YEAR).since).toBe(2012),
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

  // Brief said figma => null, but cv.ts lists figma on tryangle (2021).
  it("figma since 2021 (tryangle evidence)", () => {
    expect(deriveSkillLevel("figma", cv, YEAR).since).toBe(2021);
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
