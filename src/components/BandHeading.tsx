import type { ReactNode } from "react";

export function BandHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 mt-6 font-mono text-xs font-semibold uppercase tracking-wider text-muted first:mt-0">
      {children}
    </h2>
  );
}
