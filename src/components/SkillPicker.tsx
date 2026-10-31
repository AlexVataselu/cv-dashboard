"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { useUiStore } from "@/state/uiStore";

/**
 * The one client island behind every skill chip inside it. A press on a chip selects its skill
 * (or clears it when it is already selected); the chips' aria-pressed and data-highlight follow
 * the store, which `?skill=` also drives. One delegated listener instead of a client component per
 * chip keeps hydration short on the Overview and Skills pages.
 */
export function SkillPicker({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const paint = (selected: string | null) => {
      for (const b of ref.current?.querySelectorAll<HTMLButtonElement>("button[data-skill]") ?? []) {
        const on = b.dataset.skill === selected;
        b.setAttribute("aria-pressed", String(on));
        if (on) b.dataset.highlight = "true";
        else delete b.dataset.highlight;
      }
    };
    paint(useUiStore.getState().selectedSkill);
    return useUiStore.subscribe((s, prev) => {
      if (s.selectedSkill !== prev.selectedSkill) paint(s.selectedSkill);
    });
  }, []);

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const chip = (e.target as Element).closest<HTMLButtonElement>("button[data-skill]");
    if (!chip || !ref.current?.contains(chip)) return;
    const id = chip.dataset.skill!;
    const { selectedSkill, selectSkill } = useUiStore.getState();
    selectSkill(selectedSkill === id ? null : id);
  };

  return (
    // The buttons inside are the controls; this only listens for their clicks (keyboard included).
    <div ref={ref} onClick={onClick} className={className}>
      {children}
    </div>
  );
}
