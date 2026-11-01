"use client";

import { cv } from "@/content/cv";
import { useUiStore } from "@/state/uiStore";

/**
 * Reserves its line even when empty, so selecting a skill never shifts layout. It stays one line
 * at every width (a long skill name is truncated on screen, read in full by screen readers), so a
 * long name on a phone cannot wrap it onto a second line either.
 */
export function FilterNotice() {
  const id = useUiStore((s) => s.selectedSkill);
  const selectSkill = useUiStore((s) => s.selectSkill);
  const name = cv.skills.find((s) => s.id === id)?.name;
  return (
    <p
      className="flex min-h-7 min-w-0 basis-full items-center whitespace-nowrap text-[14px] leading-7 md:basis-auto"
      aria-live="polite"
    >
      {name ? (
        <>
          <span className="shrink-0">Marked: where&nbsp;</span>
          <span className="min-w-0 truncate font-semibold" title={name}>
            {name}
          </span>
          <span className="shrink-0">&nbsp;was used.&nbsp;</span>
          <button
            type="button"
            onClick={() => selectSkill(null)}
            className="shrink-0 font-semibold text-primary underline underline-offset-4 hover:decoration-2"
          >
            Clear
          </button>
        </>
      ) : null}
    </p>
  );
}
