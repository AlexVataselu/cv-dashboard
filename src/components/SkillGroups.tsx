import { cv } from "@/content/cv";
import { deriveAllSkillLevels } from "@/content/skillLevels";
import type { SkillGroup } from "@/content/types";
import { SkillChip } from "@/components/SkillChip";

const GROUPS: SkillGroup[] = [
  "Frontend",
  "State & data",
  "Backend",
  "Testing & quality",
  "Tooling",
];

export function SkillGroups({ headingLevel = "h2" }: { headingLevel?: "h2" | "h3" }) {
  const levels = deriveAllSkillLevels(cv, new Date().getFullYear());
  const Heading = headingLevel;
  return (
    <div className="grid gap-4">
      {GROUPS.map((g) => (
        <section key={g} aria-label={g}>
          <Heading className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted">
            {g}
          </Heading>
          <ul className="flex flex-wrap gap-2">
            {cv.skills
              .filter((s) => s.group === g)
              .map((s) => {
                const lvl = levels[s.id];
                const text =
                  lvl?.since != null ? `since ${lvl.since} · ${lvl.years} yrs` : undefined;
                return (
                  <li key={s.id}>
                    <SkillChip skillId={s.id} name={s.name} levelText={text} />
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
