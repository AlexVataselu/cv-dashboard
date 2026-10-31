import type { ReactNode } from "react";

/** A section heading on the sheet. */
export function BandHeading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="rise display text-head leading-none">
      {children}
    </h2>
  );
}
