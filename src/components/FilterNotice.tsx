"use client";

import { cv } from "@/content/cv";
import { useUiStore } from "@/state/uiStore";

/** Reserves its line even when empty, so selecting a skill never shifts layout. */
export function FilterNotice() {
  const id = useUiStore((s) => s.selectedSkill);
  const selectSkill = useUiStore((s) => s.selectSkill);
  const name = cv.skills.find((s) => s.id === id)?.name;
  return (
    <p className="min-h-7 basis-full text-[14px] leading-7 md:basis-auto" aria-live="polite">
      {name ? (
        <>
          Marked: where <span className="font-semibold">{name}</span> was used.{" "}
          <button
            type="button"
            onClick={() => selectSkill(null)}
            className="font-semibold text-primary underline underline-offset-4 hover:decoration-2"
          >
            Clear
          </button>
        </>
      ) : null}
    </p>
  );
}
