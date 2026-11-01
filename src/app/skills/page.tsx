import { SectionShell } from "@/components/SectionShell";
import { SkillAdoption } from "@/components/SkillAdoption";
import { SkillGroups } from "@/components/SkillGroups";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Skills",
  description: "Skills grouped by area, each with the year it first appears on the CV: frontend, state and data, backend, testing and quality, and tooling. Pick a skill to see where it was used.",
  path: "/skills",
});

export default function SkillsPage() {
  return (
    <SectionShell
      title="Skills"
      lead="Each year count starts at the first dated role or project on the CV that uses the skill. Pick one to mark it across Experience and Projects."
    >
      <SkillAdoption />
      <div className="mt-(--gap)">
        <SkillGroups showUsage />
      </div>
    </SectionShell>
  );
}
