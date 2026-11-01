import type { Project } from "@/content/types";
import { mediaFor } from "@/content/projectMedia";
import { BrowserFrame } from "@/components/BrowserFrame";
import { HighlightCard } from "@/components/Highlight";
import { SkillBadge } from "@/components/SkillBadge";
import { SkipIntroDiagram } from "@/components/SkipIntroDiagram";
import { ExternalIcon } from "@/components/icons";

/** Powderino has no public page yet; its card shows the CV's facts about it as a spec sheet. */
function PowderinoFacts() {
  const features = [
    "Alerts when a starred resort gets a dump",
    "Radar, wind and snow map layers",
    "Webcams",
  ];
  return (
    <div className="grid gap-4 rounded-[10px] border border-border p-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:p-5">
      <div className="rounded-lg bg-(--hue-product-tint) p-4">
        <p className="kpi-value">3,000+</p>
        <p className="mt-1 text-[14px]">ski resorts, ranked by fresh and incoming snow</p>
      </div>
      <ul className="grid content-center gap-2 text-[14px]">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            {f}
          </li>
        ))}
        <li className="flex items-start gap-2 text-muted">
          <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-control" aria-hidden="true" />
          iOS, built in React Native (Expo)
        </li>
      </ul>
    </div>
  );
}

/**
 * A personal project as a card: its year and name, what it does in the CV's words, its stack, and
 * the most honest picture there is (a live screen, a public repository, a diagram of the parts or
 * its facts).
 * A server component: only the highlight (HighlightCard) and the badge (SkillBadge) are client
 * islands, so the frames, the diagram and the media data stay out of the client bundle.
 */
export function ProjectCard({ project, eager = false }: { project: Project; eager?: boolean }) {
  const [name, ...rest] = project.title.split(", ");
  const media = mediaFor(project.id);
  const inProgress = /in progress/.test(project.title);
  return (
    <HighlightCard
      id={`project-${project.id}`}
      skillIds={project.skillIds}
      className="card grid scroll-mt-6 grid-cols-[minmax(0,1fr)] gap-6 transition-colors duration-200 lg:grid-cols-12 lg:gap-8"
    >
      <div className="min-w-0 lg:col-span-5">
        <div className="flex h-6 items-center justify-between gap-3">
          <p className="tnum text-[14px] font-medium text-muted">{project.label}</p>
          <SkillBadge skillIds={project.skillIds} />
        </div>
        <h2 className="mt-2 text-[20px] font-semibold leading-tight">{name}</h2>
        {rest.length > 0 ? (
          <p className="mt-1 text-[15px] text-muted">{rest.join(", ").replace(/ \(in progress\)$/, "")}</p>
        ) : null}
        {inProgress ? (
          <p className="mt-3">
            <span className="pill">In progress</span>
          </p>
        ) : null}
        <p className="mt-4 text-[15px] leading-relaxed">{project.description}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Stack">
          {project.stack.map((t) => (
            <li key={t} className="pill">
              {t}
            </li>
          ))}
        </ul>
        {media && media.links.length > 0 ? (
          <ul className="mt-5 grid gap-1.5">
            {media.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="card-link flex-wrap">
                  {l.label}
                  <span className="font-mono text-[12px] font-normal text-muted">{l.address}</span>
                  <ExternalIcon />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-4 lg:col-span-7">
        {project.id === "powderino" ? <PowderinoFacts /> : null}
        {media?.shot ? (
          <figure>
            <a href={media.shot.href} className="block">
              <BrowserFrame
                image={media.shot.image}
                address={media.shot.address}
                alt={media.shot.alt}
                eager={eager}
                sizes="(min-width: 1280px) 560px, (min-width: 1024px) 50vw, (min-width: 640px) 92vw, 80vw"
              />
            </a>
            <figcaption className="mt-2 text-[13px] text-muted">{media.shot.caption}</figcaption>
          </figure>
        ) : null}
      </div>
      {project.id === "stremio" ? (
        <div className="min-w-0 lg:col-span-12">
          <SkipIntroDiagram />
        </div>
      ) : null}
    </HighlightCard>
  );
}
