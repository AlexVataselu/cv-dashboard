import { Panel } from "@/components/Panel";
import { SectionNav } from "@/components/SectionNav";

export default function Home() {
  return (
    <>
      <SectionNav current="overview" />
      <main id="main" className="p-3 md:p-4">
        <Panel title="Overview" />
      </main>
    </>
  );
}
