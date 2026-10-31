/**
 * One skill: its name, its level from the CV, and a bar as long as its years on the CV's scale
 * (the longest possible is every year since the first dated role). A skill the CV gives no year
 * shows an empty track. The separator is a bare text node at font-size 0: it keeps
 * "React · since 2021 · 5 yrs" as the accessible name and text, while the row shows them apart.
 *
 * Server-rendered: the one SkillPicker around the groups handles every chip's press and keeps
 * aria-pressed in step with the store, so 33 chips cost no client components to hydrate.
 */
export function SkillChip({
  skillId,
  name,
  levelText,
  share = 0,
}: {
  skillId: string;
  name: string;
  /** e.g. "since 2021 · 5 yrs"; empty when the CV gives no year */
  levelText?: string;
  /** years as a share of the scale, 0 to 1 */
  share?: number;
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
      <span className="lvl-track" aria-hidden="true">
        {share > 0 ? <span className="lvl-fill" style={{ width: `${Math.round(share * 1000) / 10}%` }} /> : null}
      </span>
    </button>
  );
}
