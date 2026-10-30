import { FilterNotice } from "@/components/FilterNotice";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionShell } from "@/components/SectionShell";
import { cv } from "@/content/cv";

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
