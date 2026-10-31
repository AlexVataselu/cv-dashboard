import type { ReactNode } from "react";
import { SectionNav } from "@/components/SectionNav";
import { StatusBar } from "@/components/StatusBar";
import type { SectionId } from "@/lib/sections";

/** One section on the sheet: a noun title, one line about the data, the blocks, then the status bar. */
export function SectionShell({
  current,
  title,
  lead,
  actions,
  children,
}: {
  current: SectionId;
  title: string;
  lead: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <SectionNav current={current} />
      <div className="sheet flex flex-1 flex-col">
        {/* tabIndex -1: the skip link moves focus here, not just the scroll position. */}
        <main id="main" tabIndex={-1} className="flex-1 px-(--pad) pb-10 pt-6 outline-none md:pt-7">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="min-w-0">
              <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] md:text-[24px]">{title}</h1>
              <p className="mt-1.5 max-w-[72ch] text-[15px] text-muted">{lead}</p>
            </div>
            {actions}
          </div>
          {children}
        </main>
        <StatusBar />
      </div>
    </>
  );
}
