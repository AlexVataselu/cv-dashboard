import { BrowserFrame } from "@/components/BrowserFrame";
import { FilterNotice } from "@/components/FilterNotice";
import { Details, ProjectCard } from "@/components/ProjectCard";
import { SectionShell } from "@/components/SectionShell";
import { SkillBadge } from "@/components/SkillBadge";
import { ExternalIcon } from "@/components/icons";
import { cv } from "@/content/cv";
import { companyShort, period } from "@/content/career";
import { sites } from "@/content/sites";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Projects",
  description: "Selected projects by Alex Vataselu, with stack and context: React Native apps, Next.js sites and developer tooling.",
  path: "/projects",
});

const toItem = (p: { id: string; title: string; label: string; skillIds: string[] }) => ({
  id: p.id,
  name: p.title.split(", ")[0],
  meta: p.label,
  skillIds: p.skillIds,
  // the first screenshot, 240px wide, 16:9 from the top (scripts/make-thumbs.mjs)
  thumb: `/work/thumb-${p.id}`,
});
const personal = cv.projects.map(toItem);
const work = cv.workProjects.map(toItem);
const siteItems = sites.map((s) => ({ id: s.id, name: s.name, meta: s.domain, skillIds: [] as string[], thumb: s.image }));
const items = [...personal, ...work, ...siteItems];

/** "Client project at Pentalog (Globant)" from the role the work was done in (its own years are its label). */
const workContext = (roleId: string) => {
  const role = cv.roles.find((r) => r.id === roleId);
  if (!role) return undefined;
  return role.company.startsWith("Freelance") ? "Freelance project" : `Client project at ${companyShort(role)}`;
};

/**
 * One rule per item: with JS, the preview of the chosen item shows alone (CSS :has on the radio, so
 * switching needs no script). Without JS the list is hidden and every preview is shown in turn.
 */
function PreviewStyles() {
  const css = items
    .map((i) => `[data-js] .pr:has(#pick-${i.id}:checked) #preview-${i.id}{display:flex}`)
    .join("");
  return (
    <style href="project-previews" precedence="medium">
      {css}
    </style>
  );
}

function Pick({ id, name, meta, skillIds, thumb, first }: (typeof items)[number] & { first: boolean }) {
  return (
    <label className="pick" data-skills={skillIds.join(" ") || undefined} data-item={skillIds.length ? "project" : undefined}>
      <input type="radio" name="project" id={`pick-${id}`} value={id} defaultChecked={first} aria-controls={`preview-${id}`} />
      {/* its first screenshot, small: the list shows the work, not only its names */}
      <picture className="pick-thumb">
        <source type="image/avif" srcSet={`${thumb}-240.avif 240w`} sizes="64px" />
        <source type="image/webp" srcSet={`${thumb}-240.webp 240w`} sizes="64px" />
        <img src={`${thumb}-240.webp`} alt="" width={240} height={135} loading="lazy" decoding="async" />
      </picture>
      <span className="min-w-0">
        <span className="pick-name block text-[14px] font-medium leading-snug">{name}</span>
        {/* the "Uses …" badge shares the year's line, which never wraps: marking a skill moves nothing */}
        <span className="flex h-6 min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="tnum shrink-0 text-[13px] text-muted">{meta}</span>
          {skillIds.length ? <SkillBadge skillIds={skillIds} /> : null}
        </span>
      </span>
    </label>
  );
}

/* A client site, laid out like a project card: picture first, its live front page large. */
function SitePreview({ site }: { site: (typeof sites)[number] }) {
  const role = cv.roles.find((r) => r.id === site.roleId);
  return (
    <section aria-labelledby={`site-${site.id}`} className="card card-col">
      <div className="scroll-y @container">
        <header className="pj-head">
          <div className="min-w-0">
            {role ? (
              <p className="pj-meta tnum">
                {period(role)} · {companyShort(role)}
              </p>
            ) : null}
            <h2 id={`site-${site.id}`} className="pj-title">
              {site.name}
              <span className="pj-what"> {site.domain}</span>
            </h2>
          </div>
        </header>
        <div className="pj-body">
          <div className="pj-stage">
            <a href={site.url} className="block" tabIndex={-1} aria-hidden="true">
              <BrowserFrame
                image={site.image}
                address={site.domain}
                alt={`Front page of ${site.domain}`}
                sizes="(min-width: 1440px) 560px, (min-width: 1024px) 45vw, 92vw"
              />
            </a>
          </div>
          <div className="pj-aside">
            <p className="pj-lead">{site.note}</p>
            <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
              {site.stack.map((t) => (
                <li key={t} className="pill">
                  {t}
                </li>
              ))}
            </ul>
            <a href={site.url} className="card-link">
              Visit {site.domain}
              <ExternalIcon />
            </a>
          </div>
        </div>
        <section className="pj-more" aria-label={`${site.name}: details`}>
          <h3 className="pj-h3">Details</h3>
          <Details items={site.details} />
        </section>
      </div>
    </section>
  );
}

/*
  One screen: the list, each item with its first screenshot as a thumbnail (3 columns; 4 under
  1280px), beside the preview of the chosen item, picture first (9; 8). The list is a radio
  group: arrow keys move through it and a screen reader reads each choice. The preview switches by
  CSS; the motion layer, when loaded, slides the new one in.
*/
export default function ProjectsPage() {
  return (
    <SectionShell
      title="Projects"
      lead="Four things I build for myself, product work for Builder.ai, Innobyte, LocalsOnly and Eved, and seven client sites I designed and built."
    >
      <PreviewStyles />
      <div className="panel-grid pr">
        <section aria-labelledby="pick-title" className="pick-wrap card card-col span-4 pr-list">
          <div className="card-head mb-0!">
            <h2 id="pick-title" className="card-title">
              Choose a project
            </h2>
          </div>
          {/* its line is always reserved, so a marked skill shifts nothing */}
          <div>
            <FilterNotice />
          </div>
          <div role="radiogroup" aria-labelledby="pick-title" className="scroll-y mt-1">
            <p className="px-2.5 pb-1 pt-2 text-[13px] font-medium text-muted">Personal projects</p>
            <div className="pick-list">
              {personal.map((i, n) => (
                <Pick key={i.id} {...i} first={n === 0} />
              ))}
            </div>
            <p className="px-2.5 pb-1 pt-4 text-[13px] font-medium text-muted">Product work</p>
            <div className="pick-list">
              {work.map((i) => (
                <Pick key={i.id} {...i} first={false} />
              ))}
            </div>
            <p className="px-2.5 pb-1 pt-4 text-[13px] font-medium text-muted">Client sites, live</p>
            <div className="pick-list">
              {siteItems.map((i) => (
                <Pick key={i.id} {...i} first={false} />
              ))}
            </div>
          </div>
        </section>

        <div className="previews card-col span-8 pr-previews">
          {/* The first project's screenshot is above the fold on desktop: it loads eagerly, the rest lazily. */}
          {cv.projects.map((p, i) => (
            <div key={p.id} id={`preview-${p.id}`} className="preview">
              <ProjectCard project={p} eager={i === 0} />
            </div>
          ))}
          {cv.workProjects.map((p) => (
            <div key={p.id} id={`preview-${p.id}`} className="preview">
              <ProjectCard project={p} context={workContext(p.roleId)} />
            </div>
          ))}
          {sites.map((s) => (
            <div key={s.id} id={`preview-${s.id}`} className="preview">
              <SitePreview site={s} />
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
