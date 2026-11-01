/**
 * One skill: its name and, when the CV dates it, the year it first appears and the years since
 * ("since 2021 · 5 yrs"). Text only, on purpose: no bar or gauge, so nothing reads as a
 * proficiency rating. A skill the CV gives no year shows its name alone. The separator is a bare
 * text node at font-size 0: it keeps "React · since 2021 · 5 yrs" as the accessible name and
 * text, while the row shows them apart.
 *
 * Server-rendered: the one SkillPicker around the groups handles every chip's press and keeps
 * aria-pressed in step with the store, so 33 chips cost no client components to hydrate.
 */
export function SkillChip({
  skillId,
  name,
  levelText,
}: {
  skillId: string;
  name: string;
  /** e.g. "since 2021 · 5 yrs"; empty when the CV gives no year */
  levelText?: string;
}) {
  return (
    <button type="button" aria-pressed="false" data-skill={skillId} className="skill-chip">
      <span className="skill-name">{name}</span>
      {levelText ? (
        <>
          {" · "}
          <span className="skill-level">{levelText}</span>
        </>
      ) : null}
    </button>
  );
}
