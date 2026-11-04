import { SectionShell } from "@/components/SectionShell";
import { SkillMatrix } from "@/components/SkillMatrix";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Skills",
  description: "Every skill on the CV against the career's years: frontend, state and data, backend, testing and quality, and tooling, each with the roles and projects that used it. Pick a skill to see where it was used.",
  path: "/skills",
});

/*
  On one screen: the skills on the career's year axis (8 columns, its rows scrolling inside the card
  when the screen is short) beside the card of the skill in focus (4).
*/
export default function SkillsPage() {
  return (
    <SectionShell
      title="Skills"
      lead="Every skill against every role on the CV. Hover a skill to see where it was used, or a company for its stack; press a skill to mark it everywhere."
    >
      <SkillMatrix />
    </SectionShell>
  );
}
