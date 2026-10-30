"use client";

import Link from "next/link";
import { SECTIONS, type SectionId } from "@/lib/sections";
import { useUiStore } from "@/state/uiStore";

export function SectionNav({ current }: { current: SectionId }) {
  const skill = useUiStore((s) => s.selectedSkill);
  const query = skill ? `?skill=${encodeURIComponent(skill)}` : "";
  return (
    <nav aria-label="Sections" className="overflow-x-auto border-b border-border">
      <ul className="flex w-max gap-1 px-3 py-2 md:w-auto">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <Link
              href={`${s.href}${query}`}
              aria-current={s.id === current ? "page" : undefined}
              className="block whitespace-nowrap rounded-full border border-border px-3 py-1 text-sm text-text hover:border-muted aria-[current=page]:border-accent aria-[current=page]:bg-accent/10 aria-[current=page]:text-accent"
            >
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
