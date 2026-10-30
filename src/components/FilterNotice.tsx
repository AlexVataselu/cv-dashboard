"use client";

import { cv } from "@/content/cv";
import { useUiStore } from "@/state/uiStore";

/** Reserves its line even when empty, so selecting a skill never shifts layout. */
export function FilterNotice() {
  const id = useUiStore((s) => s.selectedSkill);
  const selectSkill = useUiStore((s) => s.selectSkill);
  const name = cv.skills.find((s) => s.id === id)?.name;
  return (
    <p className="mb-3 min-h-6 text-sm text-muted" aria-live="polite">
      {name ? (
        <>
          Filtered by <span className="text-accent">{name}</span> ·{" "}
          <button
            type="button"
            onClick={() => selectSkill(null)}
            className="underline hover:text-heading"
          >
            clear
          </button>
        </>
      ) : null}
    </p>
  );
}
