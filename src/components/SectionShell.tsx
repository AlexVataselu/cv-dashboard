import type { ReactNode } from "react";

/**
 * One section on the sheet: a noun title, one line about the data, then the blocks.
 * The section tabs, the sheet and the status bar are in the root layout, so they persist across
 * tab switches (one status bar, one set of web-vitals observers for the whole visit).
 */
export function SectionShell({
  title,
  lead,
  actions,
  children,
}: {
  title: string;
  lead: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    // tabIndex -1: the skip link moves focus here, not just the scroll position.
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
  );
}
