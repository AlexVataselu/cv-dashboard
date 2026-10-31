"use client";

import { useUiStore } from "@/state/uiStore";

/**
 * One line of the skills sheet: the skill at the left, its level from the CV at the right.
 * The separator is a bare text node at font-size 0: it keeps "React · since 2021 · 5 yrs" as the
 * accessible name and text, while the row shows the name and the level apart.
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
  const selected = useUiStore((s) => s.selectedSkill === skillId);
  const selectSkill = useUiStore((s) => s.selectSkill);
  return (
    <button
      type="button"
      aria-pressed={selected}
      data-highlight={selected ? "true" : undefined}
      onClick={() => selectSkill(selected ? null : skillId)}
      className="group flex min-h-11 w-full text-[0px] flex-wrap items-baseline justify-between gap-x-4 px-3 py-2 text-left transition-colors duration-150 hover:bg-band-2 aria-pressed:bg-ink aria-pressed:text-paper"
    >
      <span className="text-body font-semibold">{name}</span>
      {levelText ? (
        <>
          {" · "}
          <span className="tnum text-small text-slate group-aria-pressed:text-band">{levelText}</span>
        </>
      ) : null}
    </button>
  );
}
