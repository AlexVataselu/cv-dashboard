import { FilterNotice } from "@/components/FilterNotice";
import { pageMetadata } from "@/lib/site";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionShell } from "@/components/SectionShell";
import { cv } from "@/content/cv";

export const metadata = pageMetadata({
  title: "Projects",
  description: "Selected projects by Alex Vataselu, with stack and context: React Native apps, Next.js sites and developer tooling.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <SectionShell current="projects" title="Projects">
      <FilterNotice />
      <div className="grid gap-3">
        {cv.projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </SectionShell>
  );
}
