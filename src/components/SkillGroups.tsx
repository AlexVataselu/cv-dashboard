import Link from "next/link";
import { cv } from "@/content/cv";
import { deriveAllSkillLevels, formatLevel, usageIndex, type Usage } from "@/content/skillLevels";
import type { SkillGroup } from "@/content/types";
import { SkillChip } from "@/components/SkillChip";

const GROUPS: SkillGroup[] = [
  "Frontend",
  "State & data",
  "Backend",
  "Testing & quality",
  "Tooling",
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Links to the card on Experience or Projects, with the skill already selected there. */
function usageHref(skillId: string, u: Usage) {
  const section = u.kind === "role" ? "/experience" : "/projects";
  return `${section}?skill=${encodeURIComponent(skillId)}#${u.kind}-${u.id}`;
}

/**
 * Server-rendered, so it costs no client JS and causes no layout shift.
 * `showUsage` (the Skills page) adds where each skill was used, as plain links.
 */
export function SkillGroups({
  headingLevel = "h2",
  showUsage = false,
}: {
  headingLevel?: "h2" | "h3";
  showUsage?: boolean;
}) {
  const levels = deriveAllSkillLevels(cv, new Date().getFullYear());
  const usage = usageIndex(cv);
  const Heading = headingLevel;
  return (
    <div className="grid gap-4">
      {GROUPS.map((g) => {
        const headingId = `skill-group-${slug(g)}`;
        return (
          <section key={g} aria-labelledby={headingId}>
            <Heading
              id={headingId}
              className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted"
            >
              {g}
            </Heading>
            <ul className={showUsage ? "grid gap-2" : "flex flex-wrap gap-2"}>
              {cv.skills
                .filter((s) => s.group === g)
                .map((s) => {
                  const lvl = levels[s.id];
                  const usedIn = showUsage ? (lvl?.usedIn ?? []).map((id) => usage[id]) : [];
                  return (
                    <li
                      key={s.id}
                      className={showUsage ? "flex flex-wrap items-center gap-x-3 gap-y-1" : undefined}
                    >
                      <SkillChip skillId={s.id} name={s.name} levelText={formatLevel(lvl)} />
                      {usedIn.length > 0 ? (
                        <p className="text-xs text-muted">
                          Used in{" "}
                          {usedIn.map((u, i) => (
                            <span key={u.id}>
                              {i > 0 ? ", " : null}
                              <Link
                                href={usageHref(s.id, u)}
                                prefetch={false}
                                className="text-text underline decoration-border underline-offset-2 hover:text-heading hover:decoration-muted"
                              >
                                {u.name}
                              </Link>
                            </span>
                          ))}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
