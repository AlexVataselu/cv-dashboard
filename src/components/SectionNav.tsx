"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { SECTIONS, type SectionId } from "@/lib/sections";
import { useUiStore } from "@/state/uiStore";

/** The sections as folder tabs standing on the top edge of the sheet. The open one is the sheet's own paper. */
export function SectionNav({ current }: { current: SectionId }) {
  const skill = useUiStore((s) => s.selectedSkill);
  const query = skill ? `?skill=${encodeURIComponent(skill)}` : "";
  return (
    <nav aria-label="Sections" className="pt-2">
      <ul className="flex flex-wrap items-end gap-x-1 gap-y-1.5 md:gap-x-1.5">
        {SECTIONS.map((s, i) => (
          <li key={s.id} className="enter" style={{ "--i": i } as CSSProperties}>
            <Link
              href={`${s.href}${query}`}
              prefetch={false}
              aria-current={s.id === current ? "page" : undefined}
              className="folder-tab block whitespace-nowrap bg-tab px-4 pb-2.5 pt-3 text-body font-semibold text-ink hover:bg-paper aria-[current=page]:bg-paper md:px-7 md:pb-3 md:pt-3.5"
            >
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
