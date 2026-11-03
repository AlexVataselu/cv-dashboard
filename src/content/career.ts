import { cv } from "./cv";
import type { Role } from "./types";

/**
 * The kind of work each dated role on the CV was. The four kinds are the screen's four data hues
 * (product teams cobalt, independent teal, e-commerce amber, the backend years rose), used the
 * same way everywhere.
 */
export type WorkKind = "product" | "indie" | "shop" | "backend";

export const KIND_LABEL: Record<WorkKind, string> = {
  product: "Product team",
  indie: "Independent",
  shop: "E-commerce",
  backend: "Backend & web",
};

/** Legend order: newest kind of work first, as the CV reads. */
export const KINDS: WorkKind[] = ["product", "indie", "shop", "backend"];

const KIND_OF_ROLE: Record<string, WorkKind> = {
  "freelance-2025": "indie",
  pentalog: "product",
  tryangle: "product",
  "freelance-2021": "indie",
  lhel: "shop",
  zega: "backend",
  kemblimed: "backend",
};

export const kindOf = (roleId: string): WorkKind => KIND_OF_ROLE[roleId] ?? "indie";

/** Where each result on the CV happened (the role whose bullet states it). */
export const IMPACT_ROLE: Record<string, string> = {
  Pentalog: "pentalog",
  LocalsOnly: "freelance-2021",
  "EyeExcellence / OrlRasnov": "freelance-2021",
  "TryAngle Labs": "tryangle",
};

export const roleEnd = (r: Role, now: number) => (r.end === "now" ? now : r.end);
export const roleYears = (r: Role, now: number) => roleEnd(r, now) - r.start;
export const period = (r: Role) => `${r.start}–${r.end === "now" ? "now" : r.end}`;
/** "Pentalog (Globant)" from "Pentalog (Globant), client: Builder.ai"; "Freelance" from "Freelance, self-employed". */
export const companyShort = (r: Role) => r.company.split(/,| · /)[0].trim();

export const FIRST_YEAR = Math.min(...cv.roles.map((r) => r.start));

/** The CV's year: every count runs to it, not to the build date (see Cv.asOf). */
export const AS_OF = cv.asOf;

/** Calendar years covered by at least one of `roles` (roles that run side by side count once). */
export function coveredYears(roles: Role[], now: number = AS_OF) {
  const covered = new Set<number>();
  for (const r of roles) for (let y = r.start; y < roleEnd(r, now); y++) covered.add(y);
  return covered.size;
}

/** The years two or more roles ran side by side, as a start and an end, or null if none did. */
export function overlapSpan(now: number = AS_OF): { start: number; end: number } | null {
  const count = new Map<number, number>();
  for (const r of cv.roles) for (let y = r.start; y < roleEnd(r, now); y++) count.set(y, (count.get(y) ?? 0) + 1);
  const shared = [...count].filter(([, n]) => n > 1).map(([y]) => y);
  return shared.length ? { start: Math.min(...shared), end: Math.max(...shared) + 1 } : null;
}

/** Years of each kind of work, summed over its roles (as the bars show them). */
export function kindYears(k: WorkKind, now: number = AS_OF) {
  return cv.roles.filter((r) => kindOf(r.id) === k).reduce((sum, r) => sum + roleYears(r, now), 0);
}

/**
 * Totals the KPI strip and the timeline show, computed from the dated roles. `years` counts each
 * calendar year once; `overlap` is the years two roles ran side by side (TryAngle Labs beside the
 * 2021 freelance work), so the kinds' years minus the overlap is exactly `years`.
 */
export function careerTotals(now: number = AS_OF) {
  const years = coveredYears(cv.roles, now);
  const roleYearSum = cv.roles.reduce((sum, r) => sum + roleYears(r, now), 0);
  const productTeams = cv.roles.filter((r) => kindOf(r.id) === "product").length;
  return { years, overlap: roleYearSum - years, productTeams };
}
