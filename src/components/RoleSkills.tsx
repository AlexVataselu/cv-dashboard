import { cv } from "@/content/cv";
import { companyShort, kindOf, period } from "@/content/career";
import { deriveAllSkillLevels, formatLevel, usageIndex } from "@/content/skillLevels";
import { SkillChip } from "@/components/SkillChip";
import { SkillPicker } from "@/components/SkillPicker";

/**
 * Under the Experience timeline: the skills of the role open in the side card. One panel per role is
 * rendered at build time; CSS shows the one RoleNav names in `data-current` (one rule per role,
 * written from the CV, so a new role needs no CSS edit). Each skill is a chip: pressing it selects
 * the skill (`?skill=`), which marks every role and project on the timeline that used it.
 * Without JS the first role's panel shows, as its role is the one open.
 */
export function RoleSkills({ className }: { className?: string }) {
  const levels = deriveAllSkillLevels(cv);
  const usage = usageIndex(cv);
  const name = (id: string) => cv.skills.find((s) => s.id === id)!.name;
  const css = cv.roles
    .map((r) => `.ex[data-current="${r.id}"] .rs-panel[data-role="${r.id}"]`)
    .concat('.ex[data-current=""] .rs-panel[data-role=""]')
    .join(",");
  return (
    <section aria-labelledby="role-skills" className={`card card-col ${className ?? ""}`}>
      <style href="role-skills" precedence="medium">
        {`${css}{display:block}`}
      </style>
      <div className="card-head">
        <h2 id="role-skills" className="card-title">
          Skills in the open role
        </h2>
        <p className="meta">Press one to mark every role and project that used it.</p>
      </div>
      <SkillPicker className="card-col min-h-0 flex-1">
        <div className="scroll-y">
          <div className="rs-panel" data-role="">
            <p className="text-[14px] text-muted">Open a role on the timeline or in the list to see its skills.</p>
          </div>
          {cv.roles.map((r) => (
            <div key={r.id} className="rs-panel" data-role={r.id}>
              <p className="mb-2 flex items-center gap-2 text-[14px]" data-kind={kindOf(r.id)}>
                <span className="key size-2.5!" aria-hidden="true" />
                <span className="font-medium">{companyShort(r)}</span>
                <span className="tnum text-muted">{period(r)}</span>
              </p>
              {r.skillIds.length > 0 ? (
                <ul className="cloud rs-chips">
                  {r.skillIds.map((id) => (
                    <li key={id}>
                      <SkillChip
                        skillId={id}
                        name={name(id)}
                        levelText={formatLevel(levels[id])}
                        used={(levels[id]?.usedIn ?? []).map((u) => usage[u].name).join(", ")}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[14px] text-muted">The CV names no skills for this role; its bullets say what the work was.</p>
              )}
            </div>
          ))}
        </div>
        <p className="readout mt-2 border-t border-rule pt-2" data-readout="" aria-hidden="true">
          Hover or focus a skill for its years and where it was used.
        </p>
      </SkillPicker>
    </section>
  );
}
