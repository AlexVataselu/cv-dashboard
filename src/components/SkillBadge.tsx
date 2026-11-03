"use client";

import { skillName } from "@/state/skillCatalog";
import { useUiStore } from "@/state/uiStore";

/**
 * Text cue for the highlight (WCAG 1.4.1: colour is not the only signal). It sits in a slot that
 * always exists at a fixed size, so showing it never shifts the card.
 */
export function SkillBadge({ skillIds }: { skillIds: string[] }) {
  const id = useUiStore((s) =>
    s.selectedSkill !== null && skillIds.includes(s.selectedSkill) ? s.selectedSkill : null,
  );
  const name = skillName(id);
  return name ? (
    <span className="min-w-0 truncate rounded-full bg-primary px-2.5 text-[12px] font-semibold leading-6 text-primary-ink">
      Uses {name}
    </span>
  ) : null;
}
