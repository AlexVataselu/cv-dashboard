import { BrowserFrame } from "@/components/BrowserFrame";
import { FilterNotice } from "@/components/FilterNotice";
import { ProjectCard } from "@/components/ProjectCard";
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
});
const personal = cv.projects.map(toItem);
const work = cv.workProjects.map(toItem);
const siteItems = sites.map((s) => ({ id: s.id, name: s.name, meta: s.domain, skillIds: [] as string[] }));
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

function Pick({ id, name, meta, skillIds, first }: (typeof items)[number] & { first: boolean }) {
  return (
    <label className="pick" data-skills={skillIds.join(" ") || undefined} data-item={skillIds.length ? "project" : undefined}>
      <input type="radio" name="project" id={`pick-${id}`} value={id} defaultChecked={first} aria-controls={`preview-${id}`} />
      <span className="min-w-0">
        <span className="pick-name block truncate text-[14px] font-medium">{name}</span>
        <span className="tnum block truncate text-[13px] text-muted">{meta}</span>
      </span>
      {skillIds.length ? (
        <span className="flex h-6 max-w-[9rem] min-w-0 items-center">
          <SkillBadge skillIds={skillIds} />
        </span>
      ) : null}
    </label>
  );
}

/* A client site as a large preview: its live front page, what it is, and the role it came from. */
function SitePreview({ site }: { site: (typeof sites)[number] }) {
  const role = cv.roles.find((r) => r.id === site.roleId);
  return (
    <section aria-labelledby={`site-${site.id}`} className="card card-col">
      {/* Laid out like a project card: the text beside the live page when the preview is wide. */}
      <div className="scroll-y @container">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 @2xl:grid-cols-12 @2xl:gap-8">
          <div className="min-w-0 @2xl:col-span-5">
            {role ? (
              <p className="tnum text-[14px] font-medium text-muted">
                {companyShort(role)} · {period(role)}
              </p>
            ) : null}
            <h2 id={`site-${site.id}`} className="mt-2 text-[20px] font-semibold leading-tight">
              {site.name}
            </h2>
            <p className="mt-1 font-mono text-[13px] text-muted">{site.domain}</p>
            <p className="mt-4 text-[15px] leading-relaxed">{site.note}</p>
            <h3 className="mt-4 text-[13px] font-medium text-muted">Details</h3>
            <ul className="mt-1.5 grid gap-1.5 text-[14px] leading-snug">
              {site.details.map((d) => (
                <li key={d} className="flex items-start gap-2">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Stack">
              {site.stack.map((t) => (
                <li key={t} className="pill">
                  {t}
                </li>
              ))}
            </ul>
            <a href={site.url} className="card-link mt-5">
              Visit {site.domain}
              <ExternalIcon />
            </a>
          </div>
          <div className="min-w-0 @2xl:col-span-7">
            <a href={site.url} className="block" tabIndex={-1} aria-hidden="true">
              <BrowserFrame
                image={site.image}
                address={site.domain}
                alt={`Front page of ${site.domain}`}
                sizes="(min-width: 1024px) 640px, 92vw"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/*
  One screen: the list (4 columns) beside the preview of the chosen item (8). The list is a radio
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
        <section aria-labelledby="pick-title" className="pick-wrap card card-col span-4">
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

        <div className="previews card-col span-8">
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
