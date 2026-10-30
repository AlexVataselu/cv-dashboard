import type { ReactNode } from "react";
import { Panel } from "@/components/Panel";
import { SectionNav } from "@/components/SectionNav";
import type { SectionId } from "@/lib/sections";

export function SectionShell({
  current,
  title,
  children,
}: {
  current: SectionId;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <SectionNav current={current} />
      {/* tabIndex -1: the skip link moves focus here, not just the scroll position. */}
      <main id="main" tabIndex={-1} className="section-fade p-3 outline-none md:p-4">
        <Panel title={title}>{children}</Panel>
      </main>
    </>
  );
}
