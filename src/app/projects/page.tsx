import { BandHeading } from "@/components/BandHeading";
import { FilterNotice } from "@/components/FilterNotice";
import { pageMetadata } from "@/lib/site";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionShell } from "@/components/SectionShell";
import { SitesGallery } from "@/components/SitesGallery";
import { cv } from "@/content/cv";

export const metadata = pageMetadata({
  title: "Projects",
  description: "Selected projects by Alex Vataselu, with stack and context: React Native apps, Next.js sites and developer tooling.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <SectionShell
      current="projects"
      title="Projects"
      lead="Three things I build for myself, and the client sites I designed and built end to end."
    >
      <FilterNotice />
      <div className="-mx-5 mt-4 grid gap-10 md:-mx-7 md:gap-16">
        {cv.projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
      <section aria-labelledby="sites" className="mt-24 md:mt-36">
        <BandHeading id="sites">Client sites, live</BandHeading>
        <p className="rise mt-4 max-w-[52ch]">
          Design in Figma, then the build, the tests and the launch: one point of contact for design and code.
        </p>
        <div className="mt-10">
          <SitesGallery />
        </div>
      </section>
    </SectionShell>
  );
}
