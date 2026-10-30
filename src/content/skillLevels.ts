import type { Cv } from "@/content/types";

export interface SkillLevel {
  skillId: string;
  since: number | null;
  years: number | null;
  /** role/project ids, newest first */
  usedIn: string[];
}

const IMPLIED_SINCE: Record<string, number> = {
  html: 2017,
  css: 2017,
  javascript: 2017,
};

export function deriveSkillLevel(
  skillId: string,
  data: Cv,
  currentYear: number,
): SkillLevel {
  const evidence = [...data.roles, ...data.projects]
    .filter((e) => e.skillIds.includes(skillId))
    .map((e, index) => ({ id: e.id, start: e.start, index }))
    .sort((a, b) => b.start - a.start || a.index - b.index);

  const starts = evidence.map((e) => e.start);
  if (skillId in IMPLIED_SINCE) starts.push(IMPLIED_SINCE[skillId]);

  const usedIn = evidence.map((e) => e.id);
  const earliest = starts.length ? Math.min(...starts) : null;

  if (earliest === null || earliest >= currentYear) {
    return { skillId, since: null, years: null, usedIn };
  }
  return { skillId, since: earliest, years: currentYear - earliest, usedIn };
}

export function deriveAllSkillLevels(
  data: Cv,
  currentYear: number,
): Record<string, SkillLevel> {
  return Object.fromEntries(
    data.skills.map((s) => [s.id, deriveSkillLevel(s.id, data, currentYear)]),
  );
}

/** "since 2021 · 5 yrs", "since 2025 · 1 yr"; undefined when the CV gives no year. */
export function formatLevel(level: SkillLevel | undefined): string | undefined {
  if (level?.since == null || level.years == null) return undefined;
  return `since ${level.since} · ${level.years} ${level.years === 1 ? "yr" : "yrs"}`;
}

export interface Usage {
  id: string;
  /** company for roles, title for projects, shortened to the part before the first comma */
  name: string;
  kind: "role" | "project";
}

const shortName = (s: string) => s.split(/,| · /)[0].trim();

/** Display names for every role and project; repeated names get their start year. */
export function usageIndex(data: Cv): Record<string, Usage> {
  const entries = [
    ...data.roles.map((r) => ({ id: r.id, name: shortName(r.company), start: r.start, kind: "role" as const })),
    ...data.projects.map((p) => ({ id: p.id, name: shortName(p.title), start: p.start, kind: "project" as const })),
  ];
  const count = (name: string) => entries.filter((e) => e.name === name).length;
  return Object.fromEntries(
    entries.map((e) => [
      e.id,
      { id: e.id, kind: e.kind, name: count(e.name) > 1 ? `${e.name} ${e.start}` : e.name },
    ]),
  );
}
