"use client";

import { useUiStore } from "@/state/uiStore";

/**
 * One skill: its name, its level from the CV, and a bar as long as its years on the CV's scale
 * (the longest possible is every year since the first dated role). A skill the CV gives no year
 * shows an empty track. The separator is a bare text node at font-size 0: it keeps
 * "React · since 2021 · 5 yrs" as the accessible name and text, while the row shows them apart.
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
  const selected = useUiStore((s) => s.selectedSkill === skillId);
  const selectSkill = useUiStore((s) => s.selectSkill);
  return (
    <button
      type="button"
      aria-pressed={selected}
      data-highlight={selected ? "true" : undefined}
      onClick={() => selectSkill(selected ? null : skillId)}
      className="flex min-h-11 w-full flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5 rounded-md px-2 py-2 text-left text-[0px] transition-colors duration-150 hover:bg-raised aria-pressed:bg-[var(--hue-product-tint)] aria-pressed:shadow-[inset_0_0_0_1px_var(--primary)]"
    >
      <span className="text-[14px] font-medium leading-snug">{name}</span>
      {levelText ? (
        <>
          {" · "}
          <span className="tnum text-[12px] leading-snug text-muted">{levelText}</span>
        </>
      ) : null}
      <span className="lvl-track basis-full" aria-hidden="true">
        {share > 0 ? <span className="lvl-fill" style={{ width: `${Math.round(share * 1000) / 10}%` }} /> : null}
      </span>
    </button>
  );
}
