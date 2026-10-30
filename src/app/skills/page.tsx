import { SectionShell } from "@/components/SectionShell";
import { SkillGroups } from "@/components/SkillGroups";

export default function SkillsPage() {
  return (
    <SectionShell current="skills" title="Skills">
      <SkillGroups />
    </SectionShell>
  );
}
