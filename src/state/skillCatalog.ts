/**
 * Skill names for the client islands, without the CV module. The server layout hands the
 * id-to-name list to SkillParamSync, which registers it here before any island reads it, so the
 * whole CV (roles, bullets, projects) never ships in the first-load JS.
 */
let names: Record<string, string> = {};

export function registerSkills(list: [string, string][]) {
  if (Object.keys(names).length === list.length) return;
  names = Object.fromEntries(list);
}

export const skillName = (id: string | null | undefined) => (id ? names[id] : undefined);
export const isSkill = (id: string | null): id is string => !!id && id in names;
