import { KpiStrip } from "@/components/KpiStrip";
import { ResultsCard, RolesCard, StackCard } from "@/components/Recruiter";
import { SectionShell } from "@/components/SectionShell";
import { HOME_DESCRIPTION, pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  description: HOME_DESCRIPTION,
  path: "/",
});

/*
  The Overview, read the way a recruiter reads a CV: the four headline figures, then where Alex has
  worked (one line a role, newest first) beside the results and the core stack with its years.
  One idea a card, nothing to decode. On one screen (1024x640 and up) the roles card runs the
  height of the two right-hand cards; below desktop the cards flow one under the other.
*/
export default function Home() {
  return (
    <SectionShell title="Overview" lead="Senior frontend engineer for React and React Native teams, 14 years building software.">
      <div className="panel-grid rc-ov">
        <KpiStrip className="rc-ov-kpis" />
        <RolesCard className="rc-ov-roles" />
        <ResultsCard className="rc-ov-res" />
        <StackCard className="rc-ov-stack" />
      </div>
    </SectionShell>
  );
}
