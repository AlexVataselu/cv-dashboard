import Link from "next/link";
import { cv } from "@/content/cv";
import { FIRST_YEAR } from "@/content/career";
import { deriveAllSkillLevels, formatLevel, usageIndex, type Usage } from "@/content/skillLevels";
import type { SkillGroup } from "@/content/types";
import { SkillChip } from "@/components/SkillChip";
import { SkillPicker } from "@/components/SkillPicker";

export const GROUPS: SkillGroup[] = ["Frontend", "State & data", "Backend", "Testing & quality", "Tooling"];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Links to the card on Experience or Projects, with the skill already selected there. */
function usageHref(skillId: string, u: Usage) {
  const section = u.kind === "role" ? "/experience" : "/projects";
  return `${section}?skill=${encodeURIComponent(skillId)}#${u.kind}-${u.id}`;
}

/**
 * Server-rendered, so it costs no client JS and causes no layout shift.
 * Without `showUsage` (the Overview) the five groups sit side by side as columns.
 * With it (the Skills page) each group is a card, and each skill says where it was used.
 */
export function SkillGroups({
  headingLevel = "h2",
  showUsage = false,
}: {
  headingLevel?: "h2" | "h3";
  showUsage?: boolean;
}) {
  const now = new Date().getFullYear();
  const levels = deriveAllSkillLevels(cv, now);
  const usage = usageIndex(cv);
  const scale = now - FIRST_YEAR;
  const Heading = headingLevel;
  return (
    <SkillPicker
      className={
        showUsage
          ? "gap-(--gap) md:columns-2 xl:columns-3 [&>section]:mb-(--gap) [&>section]:break-inside-avoid"
          : "grid gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      }
    >
      {GROUPS.map((g) => {
        const headingId = `skill-group-${slug(g)}`;
        const items = cv.skills.filter((s) => s.group === g);
        return (
          <section key={g} aria-labelledby={headingId} className={showUsage ? "card" : "min-w-0"}>
            <div className={showUsage ? "mb-3 flex items-baseline justify-between gap-3" : "mb-1 px-2"}>
              <Heading id={headingId} className={showUsage ? "card-title" : "text-[14px] font-semibold"}>
                {g}
              </Heading>
              {showUsage ? <p className="meta tnum">{items.length} skills</p> : null}
            </div>
            <ul className="grid">
              {items.map((s) => {
                const lvl = levels[s.id];
                const usedIn = showUsage ? (lvl?.usedIn ?? []).map((id) => usage[id]) : [];
                return (
                  <li key={s.id}>
                    <SkillChip
                      skillId={s.id}
                      name={s.name}
                      levelText={formatLevel(lvl)}
                      share={lvl?.years ? lvl.years / scale : 0}
                    />
                    {usedIn.length > 0 ? (
                      <p className="px-2 pb-2 text-[13px] text-muted">
                        Used in{" "}
                        {usedIn.map((u, i) => (
                          <span key={u.id}>
                            {i > 0 ? ", " : null}
                            <Link
                              href={usageHref(s.id, u)}
                              prefetch={false}
                              className="font-medium text-primary underline-offset-2 hover:underline"
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
    </SkillPicker>
  );
}
