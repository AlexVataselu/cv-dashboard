import { SectionShell } from "@/components/SectionShell";
import { pageMetadata } from "@/lib/site";
import { SkillGroups } from "@/components/SkillGroups";

export const metadata = pageMetadata({
  title: "Skills",
  description: "Skill levels grouped by area: frontend, state and data, backend, testing and quality, and tooling. Pick a skill to see where it was used.",
  path: "/skills",
});

export default function SkillsPage() {
  return (
    <SectionShell current="skills" title="Skills">
      <SkillGroups />
    </SectionShell>
  );
}
