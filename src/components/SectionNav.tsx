"use client";

import Link from "next/link";
import { SECTIONS, type SectionId } from "@/lib/sections";
import { useUiStore } from "@/state/uiStore";

/** The sections as tabs on the frame, over the sheet. The open one carries the cobalt underline. */
export function SectionNav({ current }: { current: SectionId }) {
  const skill = useUiStore((s) => s.selectedSkill);
  const query = skill ? `?skill=${encodeURIComponent(skill)}` : "";
  return (
    <nav aria-label="Sections" className="px-4 md:px-3 lg:px-1 lg:pt-2">
      <ul className="tabs">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <Link
              href={`${s.href}${query}`}
              prefetch={false}
              aria-current={s.id === current ? "page" : undefined}
              className="tab"
            >
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
