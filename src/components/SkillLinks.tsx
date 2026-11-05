"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { skillName } from "@/state/skillCatalog";
import { useUiStore } from "@/state/uiStore";

/**
 * The selected skill (`?skill=`, through the store) marks every element that names it in
 * `data-skills`: the timeline's role rows and project marks, and the project list. On a page with the
 * timeline, a screen reader hears how many roles and projects it marked.
 * Also: a link to /projects#project-x chooses that project, and Esc hides a hover tip (WCAG 1.4.13).
 */
export function SkillLinks() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = /^#project-(.+)$/.exec(location.hash)?.[1];
    const pick = hash ? document.getElementById(`pick-${hash}`) : null;
    if (pick instanceof HTMLInputElement) pick.checked = true;

    const live = document.getElementById("skill-live");
    const paint = (id: string | null, announce: boolean) => {
      const n = { role: 0, project: 0 };
      for (const el of document.querySelectorAll<HTMLElement>("[data-skills]")) {
        if (id && el.dataset.skills!.split(" ").includes(id)) {
          el.dataset.highlight = "true";
          if (el.dataset.item === "role" || el.dataset.item === "project") n[el.dataset.item]++;
        } else delete el.dataset.highlight;
      }
      if (!announce || !live || !document.querySelector(".tl, .cl")) return;
      const name = skillName(id);
      live.textContent = name
        ? `${name}: marked on ${n.role} ${n.role === 1 ? "role" : "roles"} and ${n.project} ${n.project === 1 ? "project" : "projects"} in the timeline.`
        : "Skill mark cleared.";
    };
    paint(useUiStore.getState().selectedSkill, false);
    return useUiStore.subscribe((s, prev) => {
      if (s.selectedSkill !== prev.selectedSkill) paint(s.selectedSkill, true);
    });
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const off = (e: KeyboardEvent) => {
      if (e.key === "Escape") root.dataset.tipsOff = "";
    };
    const on = () => delete root.dataset.tipsOff;
    addEventListener("keydown", off);
    addEventListener("pointermove", on, { passive: true });
    addEventListener("focusin", on);
    return () => {
      removeEventListener("keydown", off);
      removeEventListener("pointermove", on);
      removeEventListener("focusin", on);
    };
  }, []);

  return <p id="skill-live" className="sr-only" aria-live="polite" />;
}
