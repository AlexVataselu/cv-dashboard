import { cv } from "@/content/cv";
import { deriveAllSkillLevels, formatLevel, usageIndex, type Usage } from "@/content/skillLevels";
import type { SkillGroup } from "@/content/types";
import { SkillChip } from "@/components/SkillChip";
import { SkillPicker } from "@/components/SkillPicker";

export const GROUPS: SkillGroup[] = ["Frontend", "State & data", "Backend", "Testing & quality", "Tooling"];

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Links to the item on Experience or Projects, with the skill already selected there. */
export function usageHref(skillId: string, u: Usage) {
  const section = u.kind === "role" ? "/experience" : "/projects";
  return `${section}?skill=${encodeURIComponent(skillId)}#${u.kind}-${u.id}`;
}

/**
 * The group filter: one radio per group plus "All", drawn as a segmented control. Radios need no JS
 * (arrow keys move between them, and a screen reader reads "Backend, 3 of 6, selected"); CSS
 * (`.filtered:has(:checked)`) shows the chosen group alone. "All" is the default, so nothing is
 * hidden at first paint or without JS.
 */
export function GroupFilter({ name }: { name: string }) {
  const counts = GROUPS.map((g) => cv.skills.filter((s) => s.group === g).length);
  return (
    <fieldset className="seg" data-filter="">
      <legend className="sr-only">Show skills from</legend>
      <label>
        <input type="radio" name={name} value="all" defaultChecked />
        All <span className="count">{cv.skills.length}</span>
      </label>
      {GROUPS.map((g, i) => (
        <label key={g}>
          <input type="radio" name={name} value={slug(g)} />
          {g} <span className="count">{counts[i]}</span>
        </label>
      ))}
    </fieldset>
  );
}

/**
 * The Overview's skills: every skill as a compact chip, in group order, behind the group filter;
 * hovering or focusing a chip reads its years and where it was used under the cloud. Server-rendered,
 * so it costs no client JS and causes no layout shift. (The Skills page draws them on the career's
 * axis instead: SkillMatrix.)
 */
export function SkillGroups({ className }: { className?: string }) {
  // Counts run to the CV's year (cv.asOf), the default.
  const levels = deriveAllSkillLevels(cv);
  const usage = usageIndex(cv);
  const roleIds = new Set(cv.roles.map((r) => r.id));
  return (
    <section aria-labelledby="levels" className={`card card-col filtered ${className ?? ""}`}>
      <div className="card-head">
        <h2 id="levels" className="card-title">
          Skills, by first dated use
        </h2>
        <p className="meta">Press one to mark where it was used.</p>
      </div>
      <GroupFilter name="overview-group" />
      <SkillPicker className="card-col mt-3 min-h-0 flex-1">
        <ul className="cloud scroll-y" data-flip-root="">
          {GROUPS.map((g) => {
            const items = cv.skills.filter((s) => s.group === g);
            return items.map((s, i) => {
              const lvl = levels[s.id];
              const used = (lvl?.usedIn ?? []).map((id) => usage[id].name).join(", ");
              return (
                <li key={s.id} data-group={slug(g)} data-flip="" className="contents-li">
                  {i === 0 ? <span className="cloud-group">{g}</span> : null}
                  <SkillChip
                    skillId={s.id}
                    name={s.name}
                    levelText={formatLevel(lvl)}
                    roles={(lvl?.usedIn ?? []).filter((id) => roleIds.has(id))}
                    used={used}
                  />
                </li>
              );
            });
          })}
        </ul>
        <p className="readout mt-2 border-t border-rule pt-2" data-readout="" aria-hidden="true">
          Hover or focus a skill for its years and where it was used.
        </p>
      </SkillPicker>
    </section>
  );
}
