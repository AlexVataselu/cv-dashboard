"use client";

import type { Project } from "@/content/types";
import { ProjectPosterPanel } from "@/components/ProjectPosterPanel";
import { SkillBadge } from "@/components/SkillBadge";
import { posterFor } from "@/content/projectPosters";
import { useUiStore } from "@/state/uiStore";

/**
 * A personal project, large: a full-width poster of its claim in one of the page's field colours,
 * then its year, name and description.
 */
export function ProjectCard({ project }: { project: Project }) {
  const highlighted = useUiStore(
    (s) => s.selectedSkill !== null && project.skillIds.includes(s.selectedSkill),
  );
  const [name, ...rest] = project.title.split(", ");
  const poster = posterFor(project.id);
  return (
    <article
      id={`project-${project.id}`}
      data-highlight={highlighted ? "true" : undefined}
      className="rise flex scroll-mt-6 flex-col gap-8 p-5 transition-colors duration-200 data-[highlight=true]:bg-band md:p-7"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
        <div>
          <div className="flex min-h-6 items-center justify-between gap-3">
            <p className="display tnum text-head text-graphite">{project.label}</p>
            <SkillBadge skillIds={project.skillIds} />
          </div>
          <h2 className="display mt-4 text-poster leading-[0.88]">{name}</h2>
          {rest.length > 0 ? (
            <p className="mt-3 text-lead font-semibold leading-snug">{rest.join(", ")}</p>
          ) : null}
        </div>
        <div className="lg:pt-10">
          <p className="max-w-[62ch] text-lead leading-[1.5]">{project.description}</p>
          <p className="mt-4 text-small text-slate">{project.stack.join(" · ")}</p>
        </div>
      </div>
      {/* After the text in reading order, first on screen. */}
      {poster ? <ProjectPosterPanel poster={poster} name={name} large showName={false} className="-order-1" /> : null}
    </article>
  );
}
