import { SectionShell } from "@/components/SectionShell";
import { cv } from "@/content/cv";
import { CORE_STACK, skillWhere, skillYears } from "@/content/recruiter";
import type { SkillGroup } from "@/content/types";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Skills",
  description: "Every skill on the CV, by group, with its years of use and the roles and projects that used it: frontend, state and data, backend, testing and quality, and tooling.",
  path: "/skills",
});

/** "Pentalog (Globant), TryAngle Labs and 3 own projects"; "likely at …" for an estimate. */
function whereLine({ roles, projects, estimated }: ReturnType<typeof skillWhere>) {
  const parts = [...roles];
  if (projects.length) parts.push(projects.length === 1 ? projects[0] : `${projects.length} own projects`);
  const used = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : (parts[0] ?? "");
  const likely = estimated.length ? `likely at ${estimated.join(", ")}` : "";
  return [used, likely].filter(Boolean).join("; ");
}

const CORE = new Set(CORE_STACK.flatMap((g) => g.ids));
const GROUPS: { group: SkillGroup; title: string; className: string }[] = [
  { group: "Frontend", title: "Frontend", className: "rc-sk-front" },
  { group: "Testing & quality", title: "Testing and quality", className: "rc-sk-test" },
  { group: "State & data", title: "State and data", className: "rc-sk-data" },
  { group: "Backend", title: "Backend", className: "rc-sk-back" },
  { group: "Tooling", title: "Tooling and delivery", className: "rc-sk-tool" },
];

/*
  Skills as five plain lists, one per group: each skill with its years of dated use and where it was
  used, in words. The core stack (the Overview's) is marked, so the skills a frontend role asks for
  stand out first. No matrix to decode.
*/
export default function SkillsPage() {
  return (
    <SectionShell title="Skills" lead={`${cv.skills.length} skills from the CV, each with its years and where it was used. Core skills are marked.`}>
      <div className="panel-grid rc-sk">
        {GROUPS.map(({ group, title, className }) => {
          const skills = cv.skills.filter((s) => s.group === group);
          const id = `sk-${group.replace(/\W+/g, "-").toLowerCase()}`;
          return (
            <section key={group} aria-labelledby={id} className={`card card-col ${className}`}>
              <div className="card-head">
                <h2 id={id} className="card-title">
                  {title}
                </h2>
                <p className="meta tnum">{skills.length}</p>
              </div>
              <div className="scroll-y -mx-2" tabIndex={0} role="region" aria-label={`${title}, scrollable`}>
                <ul className="rc-skills">
                  {skills.map((s) => {
                    const y = skillYears(s.id);
                    const where = skillWhere(s.id);
                    const core = CORE.has(s.id);
                    return (
                      <li key={s.id} className="rc-skill" data-core={core || undefined}>
                        <span className="rc-skill-name">
                          {core ? <span className="rc-core" role="img" aria-label="Core skill" title="Core skill" /> : null}
                          {s.name}
                        </span>
                        <span className="rc-skill-years tnum">{y ?? (where.roles.length || where.projects.length ? "" : "est.")}</span>
                        <span className="rc-skill-where">{whereLine(where)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          );
        })}
      </div>
    </SectionShell>
  );
}
