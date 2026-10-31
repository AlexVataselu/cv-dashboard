import { cv } from "./cv";
import type { Role } from "./types";

/**
 * The kind of work each dated role on the CV was. The three kinds are the screen's three data
 * hues (product teams cobalt, independent teal, e-commerce amber), used the same way everywhere.
 */
export type WorkKind = "product" | "indie" | "shop";

export const KIND_LABEL: Record<WorkKind, string> = {
  product: "Product team",
  indie: "Independent",
  shop: "E-commerce",
};

const KIND_OF_ROLE: Record<string, WorkKind> = {
  "freelance-2025": "indie",
  pentalog: "product",
  tryangle: "product",
  "freelance-2021": "indie",
  lhel: "shop",
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

/** Totals the KPI strip and the timeline show, computed from the dated roles. */
export function careerTotals(now: number) {
  const years = cv.roles.reduce((sum, r) => sum + roleYears(r, now), 0);
  const productTeams = cv.roles.filter((r) => kindOf(r.id) === "product").length;
  return { years, productTeams };
}
