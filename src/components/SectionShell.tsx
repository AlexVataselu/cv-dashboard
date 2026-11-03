import type { ReactNode } from "react";

/**
 * One section on the sheet: a noun title and one line about the data on a single row, then the
 * section's grid of cards. The section tabs, the sheet and the status bar are in the root layout, so
 * they persist across tab switches (one status bar, one set of web-vitals observers for the visit).
 *
 * On a laptop or desktop screen (1024x640 and up, with JS) <main> is exactly the height left between
 * the tabs and the status bar: the title row takes its own height and the grid (`.panel-grid`) the rest.
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
    <main id="main" tabIndex={-1} className="panel outline-none">
      <div className="panel-head">
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em]">{title}</h1>
          <p className="max-w-[80ch] text-[15px] text-muted">{lead}</p>
        </div>
        {actions}
      </div>
      {children}
    </main>
  );
}
