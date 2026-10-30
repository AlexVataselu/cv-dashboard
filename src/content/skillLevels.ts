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
