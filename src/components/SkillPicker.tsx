"use client";

import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { useUiStore } from "@/state/uiStore";

/**
 * The one client island behind every skill button inside it. A press on a skill selects it (or
 * clears it when it is already selected); the buttons' aria-pressed and data-highlight follow the
 * store, which `?skill=` also drives. One delegated listener instead of a client component per
 * button keeps hydration short on the Overview, Experience and Skills pages.
 *
 * - With a `[data-readout]` element inside (the Overview, Experience), hovering or focusing a skill
 *   writes its name, its years and where it was used there; leaving shows the selected skill again.
 * - With `data-active` on the root (the Skills matrix), the root names the skill in focus: the one
 *   hovered or focused, else the selected one, else "none". CSS shows that skill's card from it.
 * - With `roving` (the Skills matrix), the rows are one tab stop: arrow keys, Home and End move
 *   between the rows that are showing (a group filter can hide some), as in a listbox.
 */
export function SkillPicker({
  children,
  className,
  roving = false,
  "data-active": active,
}: {
  children: ReactNode;
  className?: string;
  roving?: boolean;
  "data-active"?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current!;
    const out = root.querySelector<HTMLElement>("[data-readout]");
    const idle = out?.innerHTML ?? "";
    const tracks = root.dataset.active !== undefined;
    const chips = () => root.querySelectorAll<HTMLButtonElement>("button[data-skill]");
    const read = (chip?: HTMLButtonElement | null) => {
      if (tracks) root.dataset.active = chip?.dataset.skill ?? "none";
      if (!out) return;
      if (!chip) return void (out.innerHTML = idle);
      const used = chip.dataset.used;
      out.textContent = "";
      const b = document.createElement("b");
      b.textContent = chip.textContent;
      out.append(b, used ? `. Used in ${used}.` : ". On the CV, with no dated role or project.");
    };
    const selected = () => [...chips()].find((b) => b.dataset.skill === useUiStore.getState().selectedSkill);
    const rows = () => [...root.querySelectorAll<HTMLButtonElement>(".sm-row")].filter((b) => b.offsetParent !== null);
    // The one row in the tab order: the selected one when it shows, else the first showing.
    const stop = () => {
      if (!roving) return;
      const shown = rows();
      const pick = shown.find((b) => b.getAttribute("aria-pressed") === "true") ?? shown[0];
      for (const b of root.querySelectorAll<HTMLButtonElement>(".sm-row")) b.tabIndex = b === pick ? 0 : -1;
    };
    const paint = (id: string | null) => {
      for (const b of chips()) {
        const on = b.dataset.skill === id;
        b.setAttribute("aria-pressed", String(on));
        if (on) b.dataset.highlight = "true";
        else delete b.dataset.highlight;
      }
      read(selected());
      stop();
    };
    // In the matrix, the skill in focus stays put while the pointer or focus travels into its card
    // (to follow one of its links) or across the gaps between rows; it changes on another skill, and
    // falls back to the selected one only when the pointer or focus leaves the whole view.
    const over = (e: Event) => {
      const chip = (e.target as Element).closest<HTMLButtonElement>("button[data-skill]");
      if (tracks && !chip) return;
      read(chip ?? selected());
    };
    const leave = (e: Event) => {
      if (tracks && e.type === "focusout") {
        const next = (e as FocusEvent).relatedTarget;
        if (next instanceof Node && root.contains(next)) return;
      }
      read(selected());
    };
    // A group filter changed what shows: the tab stop moves to a row that is still there.
    const changed = () => requestAnimationFrame(stop);
    paint(useUiStore.getState().selectedSkill);
    root.addEventListener("pointerover", over);
    root.addEventListener("focusin", over);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("focusout", leave);
    root.addEventListener("change", changed);
    const unsub = useUiStore.subscribe((s, prev) => {
      if (s.selectedSkill !== prev.selectedSkill) paint(s.selectedSkill);
    });
    return () => {
      unsub();
      root.removeEventListener("pointerover", over);
      root.removeEventListener("focusin", over);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("focusout", leave);
      root.removeEventListener("change", changed);
    };
  }, [roving]);

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const chip = (e.target as Element).closest<HTMLButtonElement>("button[data-skill]");
    if (!chip || !ref.current?.contains(chip)) return;
    const id = chip.dataset.skill!;
    const { selectedSkill, selectSkill } = useUiStore.getState();
    selectSkill(selectedSkill === id ? null : id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!roving) return;
    const row = (e.target as Element).closest<HTMLButtonElement>(".sm-row");
    if (!row) return;
    const shown = [...ref.current!.querySelectorAll<HTMLButtonElement>(".sm-row")].filter((b) => b.offsetParent !== null);
    const i = shown.indexOf(row);
    const k = e.key;
    const next = k === "ArrowDown" ? shown[i + 1] : k === "ArrowUp" ? shown[i - 1] : k === "Home" ? shown[0] : k === "End" ? shown.at(-1) : undefined;
    if (!next) return;
    e.preventDefault();
    for (const b of shown) b.tabIndex = b === next ? 0 : -1;
    next.focus();
    next.scrollIntoView({ block: "nearest" });
  };

  return (
    // The buttons inside are the controls; this only listens for their clicks and keys.
    <div ref={ref} onClick={onClick} onKeyDown={onKeyDown} className={className} data-active={active}>
      {children}
    </div>
  );
}
