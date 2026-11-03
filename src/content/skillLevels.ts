import type { Cv } from "@/content/types";

export interface SkillLevel {
  skillId: string;
  since: number | null;
  /**
   * The year the last dated evidence ends, when every piece of it ends before the CV's year (the
   * skill is not in current use on the CV); null while the skill is still in use, or undated.
   */
  until: number | null;
  /** The dated spans of use, oldest first, merged where they touch; empty when undated. */
  spans: { start: number; end: number }[];
  /** In use: years since `since`. Past: the years actually covered by `spans`. */
  years: number | null;
  /** role/project ids, newest first */
  usedIn: string[];
}

/**
 * Skills no dated role lists by name but the earliest dated role clearly implies: Kemblimed
 * (2012 to 2013) was a web developer role, so HTML, CSS and JavaScript date from 2012, and every
 * web role since keeps them in use.
 */
const IMPLIED_SINCE: Record<string, number> = {
  html: 2012,
  css: 2012,
  javascript: 2012,
};

/**
 * `currentYear` defaults to the CV's own year (`data.asOf`), never the clock. A role ends at its
 * end year ("now" is the CV's year); a project has no end on the CV, so it counts as still in use.
 */
export function deriveSkillLevel(
  skillId: string,
  data: Cv,
  currentYear: number = data.asOf,
): SkillLevel {
  const evidence = [
    ...data.roles.map((r) => ({ ...r, stop: r.end === "now" ? currentYear : r.end })),
    ...data.projects.map((p) => ({ ...p, stop: currentYear })),
  ]
    .filter((e) => e.skillIds.includes(skillId))
    .map((e, index) => ({ id: e.id, start: e.start, end: e.stop, index }))
    .sort((a, b) => b.start - a.start || a.index - b.index);

  const intervals = evidence.map(({ start, end }) => ({ start, end }));
  if (skillId in IMPLIED_SINCE) intervals.push({ start: IMPLIED_SINCE[skillId], end: currentYear });

  const usedIn = evidence.map((e) => e.id);
  const undated = { skillId, since: null, until: null, spans: [], years: null, usedIn };
  if (intervals.length === 0) return undated;

  const earliest = Math.min(...intervals.map((i) => i.start));
  if (earliest >= currentYear) return undated;

  const spans: { start: number; end: number }[] = [];
  for (const i of [...intervals].sort((a, b) => a.start - b.start)) {
    const last = spans.at(-1);
    if (last && i.start <= last.end) last.end = Math.max(last.end, i.end);
    else spans.push({ ...i });
  }
  const latest = Math.max(...spans.map((x) => x.end));
  if (latest >= currentYear) {
    return { skillId, since: earliest, until: null, spans, years: currentYear - earliest, usedIn };
  }
  const covered = spans.reduce((sum, x) => sum + (x.end - x.start), 0);
  return { skillId, since: earliest, until: latest, spans, years: covered, usedIn };
}

export function deriveAllSkillLevels(
  data: Cv,
  currentYear: number = data.asOf,
): Record<string, SkillLevel> {
  return Object.fromEntries(
    data.skills.map((s) => [s.id, deriveSkillLevel(s.id, data, currentYear)]),
  );
}

const yrs = (n: number) => `${n} ${n === 1 ? "yr" : "yrs"}`;

/**
 * "since 2021 · 5 yrs" while in use; "2013–2017 · 4 yrs" once every dated use has ended (each
 * span listed, "2013–2017, 2021–2023 · 6 yrs", when there was a break); undefined when undated.
 */
export function formatLevel(level: SkillLevel | undefined): string | undefined {
  if (level?.since == null || level.years == null) return undefined;
  if (level.until == null) return `since ${level.since} · ${yrs(level.years)}`;
  return `${level.spans.map((x) => `${x.start}–${x.end}`).join(", ")} · ${yrs(level.years)}`;
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
