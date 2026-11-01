"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS, type SectionId } from "@/lib/sections";
import { useUiStore } from "@/state/uiStore";

/** The section a path belongs to: "/experience" and "/experience/" are Experience. */
export function sectionForPath(pathname: string | null): SectionId | undefined {
  if (!pathname) return undefined;
  const path = pathname.replace(/\/+$/, "") || "/";
  return SECTIONS.find((s) => s.href === path)?.id;
}

/**
 * The sections as tabs on the frame, over the sheet. The open one carries the cobalt underline.
 * It lives in the root layout, so it follows the path; `current` overrides that (tests).
 */
export function SectionNav({ current }: { current?: SectionId }) {
  const pathname = usePathname();
  const active = current ?? sectionForPath(pathname);
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
              aria-current={s.id === active ? "page" : undefined}
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
