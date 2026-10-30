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
      <main id="main" className="section-fade p-3 md:p-4">
        <Panel title={title}>{children}</Panel>
      </main>
    </>
  );
}
