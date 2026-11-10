import { cv } from "./cv";
import { IMPACT_ROLE, companyShort } from "./career";
import { deriveSkillLevel } from "./skillLevels";
import type { ImpactStat, Role } from "./types";

/**
 * The plain-reading layer the tabs use: what a recruiter scans for, worded short, read from the same
 * CV data as everything else (nothing here adds a fact).
 */

/** The skills a frontend hiring manager looks for first, by group, in the CV's own order. */
export const CORE_STACK: { group: string; ids: string[] }[] = [
  { group: "Frontend", ids: ["react", "nextjs", "typescript", "react-native", "tailwind"] },
  { group: "Data", ids: ["tanstack-query", "graphql"] },
  { group: "Testing", ids: ["vitest", "playwright"] },
  { group: "Delivery", ids: ["github-actions", "vercel"] },
];

export const skillName = (id: string) => cv.skills.find((s) => s.id === id)?.name ?? id;

/** "5 yrs", "1 yr", or null for a skill with no year count (undated, or first used in the CV's own year). */
export function skillYears(id: string): string | null {
  const lvl = deriveSkillLevel(id, cv);
  const n = lvl.years;
  if (n === null) return null;
  return n <= 1 ? "1 yr" : `${n} yrs`;
}

/** Where a skill was used: the companies (newest first), the own projects, and the roles that most likely used it. */
export function skillWhere(id: string): { roles: string[]; projects: string[]; estimated: string[] } {
  const lvl = deriveSkillLevel(id, cv);
  const uniq = (xs: string[]) => [...new Set(xs)];
  const roleName = (rid: string) => {
    const role = cv.roles.find((r) => r.id === rid);
    return role ? companyShort(role) : null;
  };
  const roles = uniq(lvl.usedIn.map(roleName).filter((x): x is string => x !== null));
  const projects = uniq(
    lvl.usedIn.flatMap((rid) => {
      const p = cv.projects.find((x) => x.id === rid);
      return p ? [p.title.split(", ")[0]] : [];
    }),
  );
  return { roles, projects, estimated: uniq(lvl.estimatedIn.map((r) => roleName(r) ?? r)) };
}

/** The CV's results that happened in a role. */
export const resultsFor = (roleId: string): ImpactStat[] =>
  cv.impact.filter((i) => IMPACT_ROLE[i.source] === roleId);

/** The client or product a role's work was for, when the CV names one ("Builder.ai"). */
export const clientOf = (r: Role) => r.company.match(/client: (.+)$/)?.[1] ?? null;

/** A picture of each role's work, where the CV's own work has one (public/work). */
export const ROLE_SHOT: Record<string, { image: string; address: string; alt: string; widths: number[]; width: number; height: number }> = {
  "freelance-2025": { image: "/work/azuga365", address: "azuga365.ro", alt: "Front page of azuga365.ro", widths: [640, 1120], width: 1120, height: 630 },
  pentalog: { image: "/work/builderai-1", address: "builder.ai", alt: "Builder.ai, the platform built for at Pentalog", widths: [640, 1120], width: 1120, height: 630 },
  "freelance-2021": { image: "/work/localsonly-1", address: "LocalsOnly", alt: "LocalsOnly's experiences, built in Next.js and GraphQL", widths: [640, 1120], width: 1120, height: 630 },
  zega: { image: "/work/eved-1", address: "Eved", alt: "Eved, the event marketplace whose backend was built at Zega Software", widths: [640, 960], width: 960, height: 540 },
  kemblimed: { image: "/work/kemblimed", address: "kemblimed.ro", alt: "Front page of kemblimed.ro", widths: [640, 1120], width: 1120, height: 630 },
};
