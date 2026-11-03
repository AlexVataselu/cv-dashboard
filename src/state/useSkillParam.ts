import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { isSkill } from "./skillCatalog";
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

/**
 * Keeps `selectedSkill` and `?skill=` in sync. The URL is the source of truth: on mount and
 * after every navigation (links, Back/Forward) the store is re-derived from it, so a store
 * that still holds a skill while the URL has none is cleared. Selecting a skill rewrites
 * the current URL in place (replaceState, no new history entry).
 */
export function useSkillParam(): void {
  // Re-render triggers only. The effect reads the live URL, so a stale render can never
  // write an old value back.
  const urlSkill = useSearchParams().get(PARAM);
  const pathname = usePathname();

  useEffect(
    () =>
      useUiStore.subscribe((state, prev) => {
        if (state.selectedSkill !== prev.selectedSkill) writeUrl(state.selectedSkill);
      }),
    [],
  );

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get(PARAM);
    const skill = isSkill(id) ? id : null;
    if (useUiStore.getState().selectedSkill !== skill) useUiStore.getState().selectSkill(skill);
    // Invalid or empty value: drop the param.
    if (id !== null && skill === null) writeUrl(null);
  }, [urlSkill, pathname]);
}
