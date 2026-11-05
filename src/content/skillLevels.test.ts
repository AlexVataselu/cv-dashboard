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
  it.each(["react", "nextjs"])("%s since 2021, 5 years", (id) => {
    const l = deriveSkillLevel(id, cv, YEAR);
    expect(l.since).toBe(2021);
    expect(l.years).toBe(5);
  });

  it.each(["graphql", "prisma", "postgresql", "firebase", "git"])(
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
    for (const id of ["react", "react-native", "html", "git"]) {
      const l = deriveSkillLevel(id, cv, YEAR);
      expect(l.until, id).toBeNull();
      expect(formatLevel(l), id).toMatch(/^since \d{4} · \d+ yrs?$/);
    }
  });

  it.each(["tailwind", "github-actions", "sentry", "sonarqube", "graphql", "postgresql", "firebase", "git"])(
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

  it("typescript since 2017: L.H.EL (Superland) runs into TryAngle Labs, so one unbroken span", () => {
    const l = deriveSkillLevel("typescript", cv, YEAR);
    expect(l).toMatchObject({ since: 2017, until: null, years: 9, spans: [{ start: 2017, end: 2026 }] });
    expect(l.usedIn).toContain("lhel");
  });

  it.each(["magento", "prestashop"])(
    "%s is dated by L.H.EL (Superland) alone, 2017 to 2021; use that stopped in 2021 reads as its span",
    (id) => {
      const l = deriveSkillLevel(id, cv, YEAR);
      expect(l).toMatchObject({ since: 2017, until: 2021, usedIn: ["lhel"], spans: [{ start: 2017, end: 2021 }] });
      expect(formatLevel(l)).toBe("2017–2021 · 4 yrs");
    },
  );

  it.each(["html", "css", "javascript"])("%s lists L.H.EL (Superland) where it was used", (id) =>
    expect(deriveSkillLevel(id, cv, YEAR).usedIn).toContain("lhel"),
  );

  it("tanstack-query dates from LocalsOnly, in the 2021 freelance work", () => {
    const l = deriveSkillLevel("tanstack-query", cv, YEAR);
    expect(l.since).toBe(2021);
    expect(l.usedIn).toContain("freelance-2021");
  });

  it("an estimated role links a skill but never counts in its years", () => {
    const l = deriveSkillLevel("redux", cv, YEAR);
    expect(l.estimatedIn).toEqual(["tryangle"]);
    expect(l.since).toBeNull();
    expect(l.years).toBeNull();
    expect(l.usedIn).not.toContain("tryangle");
  });

  it.each(["jest", "nodejs"])(
    "%s has only current-year evidence",
    (id) => {
      const l = deriveSkillLevel(id, cv, YEAR);
      expect(l.since).toBeNull();
      expect(l.years).toBeNull();
    },
  );

  // redux, storybook, supabase: no role or project on the CV shows them; zustand and tdd: only 2026 work.
  it.each(["redux", "zustand", "storybook", "supabase", "tdd"])("%s since null", (id) =>
    expect(deriveSkillLevel(id, cv, YEAR).since).toBeNull(),
  );

  it("react testing library is dated by ReAMP (since 2024)", () => {
    const l = deriveSkillLevel("react-testing-library", cv, YEAR);
    expect(l).toMatchObject({ since: 2024, until: null });
    expect(l.usedIn).toEqual(expect.arrayContaining(["reamp", "cvdashboard"]));
  });

  it("zustand and tdd are linked to the 2026 work that uses them", () => {
    expect(deriveSkillLevel("zustand", cv, YEAR).usedIn).toEqual(["cvdashboard"]);
    expect(deriveSkillLevel("tdd", cv, YEAR).usedIn).toEqual(expect.arrayContaining(["stremio", "cvdashboard"]));
  });

  it("rest is dated by the Builder.ai work at Pentalog", () => {
    const l = deriveSkillLevel("rest", cv, YEAR);
    expect(l).toMatchObject({ since: 2024, until: null, usedIn: ["pentalog"] });
    expect(formatLevel(l)).toBe("since 2024 · 2 yrs");
  });

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
