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
 * Without `showUsage` (the Overview) the groups sit side by side as compact columns.
 * With it (the Skills page) they are set as one printed sheet, each skill with where it was used.
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
    <div
      className={
        showUsage
          ? "scallop-both -mx-5 gap-x-14 bg-band px-2 py-14 md:-mx-10 md:px-7 md:py-16 xl:-mx-13 xl:columns-2 xl:px-10 [&>section]:mb-14 [&>section]:break-inside-avoid"
          : "grid gap-x-10 gap-y-12 sm:grid-cols-2 xl:grid-cols-3"
      }
    >
      {GROUPS.map((g) => {
        const headingId = `skill-group-${slug(g)}`;
        return (
          <section key={g} aria-labelledby={headingId} className="rise">
            <Heading
              id={headingId}
              className={
                showUsage
                  ? "display mb-5 text-center text-lead leading-none"
                  : "display mb-3 px-3 text-lead leading-none"
              }
            >
              {g}
            </Heading>
            <ul className={showUsage ? "grid gap-2" : "grid"}>
              {cv.skills
                .filter((s) => s.group === g)
                .map((s) => {
                  const lvl = levels[s.id];
                  const usedIn = showUsage ? (lvl?.usedIn ?? []).map((id) => usage[id]) : [];
                  return (
                    <li key={s.id}>
                      <SkillChip skillId={s.id} name={s.name} levelText={formatLevel(lvl)} />
                      {usedIn.length > 0 ? (
                        <p className="px-3 pb-1 text-small text-slate">
                          Used in{" "}
                          {usedIn.map((u, i) => (
                            <span key={u.id}>
                              {i > 0 ? ", " : null}
                              <Link
                                href={usageHref(s.id, u)}
                                prefetch={false}
                                className="text-ink underline decoration-slate underline-offset-2 hover:decoration-2"
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
