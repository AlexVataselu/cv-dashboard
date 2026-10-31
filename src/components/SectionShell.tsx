import type { ReactNode } from "react";
import { SectionNav } from "@/components/SectionNav";
import type { SectionId } from "@/lib/sections";

/** One sheet of the CV: its title at display size, one plain sentence, then the section. */
export function SectionShell({
  current,
  title,
  lead,
  children,
}: {
  current: SectionId;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <>
      <SectionNav current={current} />
      {/* tabIndex -1: the skip link moves focus here, not just the scroll position. */}
      <main
        id="main"
        tabIndex={-1}
        className="bg-paper px-5 pb-16 pt-10 outline-none md:px-10 md:pb-24 md:pt-14 xl:px-13"
      >
        <h1 className="display text-display">{title}</h1>
        <p className="mt-6 max-w-[46ch] text-lead leading-snug md:mt-8">{lead}</p>
        {children}
      </main>
    </>
  );
}
