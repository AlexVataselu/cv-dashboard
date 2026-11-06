import type { Project } from "@/content/types";
import { mediaFor } from "@/content/projectMedia";
import { HighlightCard } from "@/components/Highlight";
import { SkillBadge } from "@/components/SkillBadge";
import { ShotGallery } from "@/components/ShotGallery";
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

/** A project's details as a list of short lines (two columns when the card is wide). */
export function Details({ items }: { items: string[] }) {
  return (
    <ul className="pj-details">
      {items.map((h) => (
        <li key={h}>{h}</li>
      ))}
    </ul>
  );
}

/**
 * A project as a card, picture first: a header line (its years, its name, what it is, who it was
 * for); then its real screenshots large, beside what it does in the CV's words, its stack and its
 * links; then its details, and for Stremio a diagram of the parts.
 * A server component: only the highlight (HighlightCard) and the badge (SkillBadge) are client
 * islands, so the frames, the diagram and the media data stay out of the client bundle.
 */
export function ProjectCard({
  project,
  eager = false,
  context,
}: {
  project: Project;
  eager?: boolean;
  /** for work done in a role: who it was done for and through */
  context?: string;
}) {
  const [name, ...rest] = project.title.split(", ");
  const media = mediaFor(project.id);
  const inProgress = /in progress/.test(project.title);
  const what = rest.join(", ").replace(/ \(in progress\)$/, "");
  return (
    <HighlightCard
      id={`project-${project.id}`}
      skillIds={project.skillIds}
      className="card card-col scroll-mt-6 transition-colors duration-200"
    >
      <div className="scroll-y @container">
        <header className="pj-head">
          <div className="min-w-0">
            <p className="pj-meta tnum">
              {project.label}
              {context ? (
                <>
                  {" · "}
                  <span>{context}</span>
                </>
              ) : null}
            </p>
            <h2 className="pj-title">
              {name}
              {what ? <span className="pj-what"> {what}</span> : null}
            </h2>
          </div>
          <div className="flex h-6 shrink-0 items-center gap-2">
            {inProgress ? <span className="pill">In progress</span> : null}
            <SkillBadge skillIds={project.skillIds} />
          </div>
        </header>
        <div className="pj-body">
          <div className="pj-stage">
            {/* Powderino shows its facts until Alex's own iOS screenshots are in (then they follow them). */}
            {project.id === "powderino" ? <PowderinoFacts /> : null}
            {media ? <ShotGallery id={project.id} title={name} shots={media.shots} eager={eager} /> : null}
            {project.id === "builderai" ? (
              <p className="text-[13px] text-muted">
                builder.ai is offline; these are its public product pages as the Internet Archive kept them. The
                internal tools I worked on were never public.
              </p>
            ) : null}
            {project.id === "eved" ? (
              <p className="text-[13px] text-muted">
                These are Eved&rsquo;s public pages from 2013 and 2014, as the Internet Archive kept them. The
                application itself sat behind a login and was never archived, so none of its screens can be shown.
              </p>
            ) : null}
          </div>
          <div className="pj-aside">
            <p className="pj-lead">{project.description}</p>
            <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
              {project.stack.map((t) => (
                <li key={t} className="pill">
                  {t}
                </li>
              ))}
            </ul>
            {media && media.links.length > 0 ? (
              <ul className="grid gap-1.5">
                {media.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="card-link block!">
                      <span className="inline-flex items-center gap-1">
                        {l.label}
                        <ExternalIcon />
                      </span>
                      <span className="block font-mono text-[12px] font-normal text-muted">{l.address}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        {project.highlights?.length ? (
          <section className="pj-more" aria-label={`${name}: details`}>
            <h3 className="pj-h3">Details</h3>
            <Details items={project.highlights} />
          </section>
        ) : null}
        {project.id === "stremio" ? (
          <div className="pj-more">
            <SkipIntroDiagram />
          </div>
        ) : null}
      </div>
    </HighlightCard>
  );
}
