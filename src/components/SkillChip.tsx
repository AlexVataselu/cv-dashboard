"use client";

import { useUiStore } from "@/state/uiStore";

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
      className="rounded-full border border-border bg-bg px-3 py-1 text-left text-sm text-text hover:border-muted data-[highlight=true]:border-accent data-[highlight=true]:bg-accent/10 data-[highlight=true]:text-accent"
    >
      {name}
      {levelText ? (
        <>
          {" · "}
          <span className="text-muted">{levelText}</span>
        </>
      ) : null}
    </button>
  );
}
