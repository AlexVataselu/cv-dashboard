"use client";

import type { Project } from "@/content/types";
import { SkillBadge } from "@/components/SkillBadge";
import { useUiStore } from "@/state/uiStore";

/** A personal project as one line of the CV's year column: the label large at the left, the project beside it. */
export function ProjectCard({ project }: { project: Project }) {
  const highlighted = useUiStore(
    (s) => s.selectedSkill !== null && project.skillIds.includes(s.selectedSkill),
  );
  const [name, ...rest] = project.title.split(", ");
  return (
    <article
      id={`project-${project.id}`}
      data-highlight={highlighted ? "true" : undefined}
      className="rise grid scroll-mt-6 gap-3 p-5 transition-colors duration-200 data-[highlight=true]:bg-band md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8 md:p-7 lg:grid-cols-[11rem_minmax(0,1fr)]"
    >
      <p className="display tnum text-lead text-graphite md:text-head">{project.label}</p>
      <div>
        <div className="flex min-h-6 items-center justify-end">
          <SkillBadge skillIds={project.skillIds} />
        </div>
        <h2 className="display text-head leading-none">{name}</h2>
        {rest.length > 0 ? (
          <p className="mt-2 text-lead font-semibold leading-snug">{rest.join(", ")}</p>
        ) : null}
        <p className="mt-4 max-w-[62ch]">{project.description}</p>
        <p className="mt-4 text-small text-slate">{project.stack.join(" · ")}</p>
      </div>
    </article>
  );
}
