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
  const at = SECTIONS.findIndex((s) => s.id === active);
  return (
    <nav aria-label="Sections" className="section-nav">
      <ul className="tabs">
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <Link
              href={`${s.href}${query}`}
              prefetch={false}
              aria-current={s.id === active ? "page" : undefined}
              // The panel slides the way the tabs run: forward to a tab on the right, back to one on the left.
              transitionTypes={[i < at ? "nav-back" : "nav-forward"]}
              className="tab"
            >
              {s.label}
              {/* The active tab's underline is one element with one view-transition name, so a
                  section switch glides it from the old tab to the new one. */}
              {s.id === active ? <span className="tab-ink" aria-hidden="true" /> : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
