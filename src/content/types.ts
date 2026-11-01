export type SkillGroup =
  | "Frontend"
  | "State & data"
  | "Backend"
  | "Testing & quality"
  | "Tooling";

export interface Skill {
  id: string;
  name: string;
  group: SkillGroup;
}

export interface Role {
  id: string;
  start: number;
  end: number | "now";
  title: string;
  company: string;
  location?: string;
  stack: string[];
  skillIds: string[];
  bullets: string[];
}

export interface Project {
  id: string;
  label: string;
  start: number;
  title: string;
  stack: string[];
  skillIds: string[];
  description: string;
}

export interface ImpactStat {
  value: string;
  label: string;
  source: string;
}

export interface GlanceStat {
  value: string;
  label: string;
}

export interface Cv {
  /**
   * The year the CV was written. Every year count on the site (roles, career totals, skill years)
   * runs to this year, not to the build date, so the computed figures always agree with the CV's
   * own fixed figures ("9 years", "5 years"). Change it only together with a new CV.
   */
  asOf: number;
  name: string;
  title: string;
  location: string;
  availability: string;
  email: string;
  links: { linkedin: string; github: string; pdf: string };
  about: string;
  glance: GlanceStat[];
  impact: ImpactStat[];
  skills: Skill[];
  roles: Role[];
  before2017: string;
  projects: Project[];
  education: { degree: string; school: string }[];
  languages: { name: string; level: string }[];
}
