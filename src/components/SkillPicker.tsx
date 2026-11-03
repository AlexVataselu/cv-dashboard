"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { useUiStore } from "@/state/uiStore";

/**
 * The one client island behind every skill chip inside it. A press on a chip selects its skill
 * (or clears it when it is already selected); the chips' aria-pressed and data-highlight follow
 * the store, which `?skill=` also drives. One delegated listener instead of a client component per
 * chip keeps hydration short on the Overview and Skills pages.
 *
 * With a `[data-readout]` element inside (the Overview), hovering or focusing a chip writes its name,
 * its years and where it was used there; leaving shows the selected skill again.
 */
export function SkillPicker({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current!;
    const out = root.querySelector<HTMLElement>("[data-readout]");
    const idle = out?.innerHTML ?? "";
    const chips = () => root.querySelectorAll<HTMLButtonElement>("button[data-skill]");
    const read = (chip?: HTMLButtonElement | null) => {
      if (!out) return;
      if (!chip) return void (out.innerHTML = idle);
      const used = chip.dataset.used;
      out.textContent = "";
      const b = document.createElement("b");
      b.textContent = chip.textContent;
      out.append(b, used ? `. Used in ${used}.` : ". On the CV, with no dated role or project.");
    };
    const selected = () => [...chips()].find((b) => b.dataset.skill === useUiStore.getState().selectedSkill);
    const paint = (id: string | null) => {
      for (const b of chips()) {
        const on = b.dataset.skill === id;
        b.setAttribute("aria-pressed", String(on));
        if (on) b.dataset.highlight = "true";
        else delete b.dataset.highlight;
      }
      read(selected());
    };
    const over = (e: Event) => read((e.target as Element).closest<HTMLButtonElement>("button[data-skill]") ?? selected());
    const leave = () => read(selected());
    paint(useUiStore.getState().selectedSkill);
    root.addEventListener("pointerover", over);
    root.addEventListener("focusin", over);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("focusout", leave);
    const unsub = useUiStore.subscribe((s, prev) => {
      if (s.selectedSkill !== prev.selectedSkill) paint(s.selectedSkill);
    });
    return () => {
      unsub();
      root.removeEventListener("pointerover", over);
      root.removeEventListener("focusin", over);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("focusout", leave);
    };
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
