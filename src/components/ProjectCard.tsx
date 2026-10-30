"use client";

import type { Project } from "@/content/types";
import { useUiStore } from "@/state/uiStore";

export function ProjectCard({ project }: { project: Project }) {
  const highlighted = useUiStore(
    (s) => s.selectedSkill !== null && project.skillIds.includes(s.selectedSkill),
  );
  return (
    <article
      data-highlight={highlighted ? "true" : undefined}
      className="rounded-md border border-border bg-bg p-3 data-[highlight=true]:border-accent data-[highlight=true]:bg-accent/10"
    >
      <p className="font-mono text-xs text-muted">{project.label}</p>
      <h2 className="text-base font-semibold text-heading">{project.title}</h2>
      <p className="mt-1 text-sm text-text">{project.description}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {project.stack.map((t) => (
          <li key={t} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
            {t}
          </li>
        ))}
      </ul>
    </article>
  );
}
