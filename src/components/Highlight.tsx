"use client";

import type { ReactNode } from "react";
import { useUiStore } from "@/state/uiStore";

/**
 * The only client part of a project card: it marks the card when the selected skill is one of its
 * own. Everything inside (text, screenshots, the diagram) is server-rendered children, so none of
 * it ships as client JS.
 */
export function HighlightCard({
  id,
  skillIds,
  className,
  children,
}: {
  id: string;
  skillIds: string[];
  className?: string;
  children: ReactNode;
}) {
  const highlighted = useUiStore((s) => s.selectedSkill !== null && skillIds.includes(s.selectedSkill));
  return (
    <article id={id} data-highlight={highlighted ? "true" : undefined} className={className}>
      {children}
    </article>
  );
}
