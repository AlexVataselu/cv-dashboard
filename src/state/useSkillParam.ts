import { useEffect } from "react";
import { cv } from "@/content/cv";
import { useUiStore } from "./uiStore";

const PARAM = "skill";

function writeUrl(skill: string | null) {
  const url = new URL(window.location.href);
  if (skill) url.searchParams.set(PARAM, skill);
  else url.searchParams.delete(PARAM);
  const next = url.pathname + url.search + url.hash;
  if (next !== window.location.pathname + window.location.search + window.location.hash) {
    window.history.replaceState(window.history.state, "", next);
  }
}

export function useSkillParam(): void {
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get(PARAM);
    if (id && cv.skills.some((s) => s.id === id)) {
      useUiStore.getState().selectSkill(id);
    } else {
      // Invalid or empty value: leave state null and drop the param.
      writeUrl(null);
    }
    return useUiStore.subscribe((state, prev) => {
      if (state.selectedSkill !== prev.selectedSkill) writeUrl(state.selectedSkill);
    });
  }, []);
}
