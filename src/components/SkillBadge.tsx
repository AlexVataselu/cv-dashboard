"use client";

import { cv } from "@/content/cv";
import { useUiStore } from "@/state/uiStore";

/**
 * Text cue for the highlight (WCAG 1.4.1: colour is not the only signal). It sits on a
 * line that always exists and is exactly one text line tall, and it adds no layout space, so showing it never shifts the card.
 */
export function SkillBadge({ skillIds }: { skillIds: string[] }) {
  const id = useUiStore((s) =>
    s.selectedSkill !== null && skillIds.includes(s.selectedSkill) ? s.selectedSkill : null,
  );
  const name = id ? cv.skills.find((s) => s.id === id)?.name : undefined;
  return name ? (
    <span className="min-w-0 truncate bg-ink px-2 text-small leading-6 font-semibold text-paper">
      Uses {name}
    </span>
  ) : null;
}
