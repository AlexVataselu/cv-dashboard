import { BrowserFrame } from "@/components/BrowserFrame";
import { CareerTimeline } from "@/components/CareerTimeline";
import { ImpactList } from "@/components/ImpactList";
import { KpiStrip } from "@/components/KpiStrip";
import { IndustriesMode, KindsMode, StackMode } from "@/components/OverviewModes";
import { LinkedStyles } from "@/components/LinkedStyles";
import { SectionShell } from "@/components/SectionShell";
import { SkillGroups } from "@/components/SkillGroups";
import { cv } from "@/content/cv";
import { period } from "@/content/career";
import { sites } from "@/content/sites";
import { HOME_DESCRIPTION, pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({ description: HOME_DESCRIPTION, path: "/" });

/** The client sites as a strip of thumbnails beside the title: each a link to the live site. */
function SitesStrip() {
  return (
    <section aria-labelledby="shipped" className="flex shrink-0 items-center gap-3">
      <h2 id="shipped" className="text-[13px] font-medium text-muted max-[1399px]:sr-only">
        Client sites, live
      </h2>
      <ul className="flex gap-2">
        {sites.map((s) => {
          const role = cv.roles.find((r) => r.id === s.roleId);
          return (
            <li key={s.id} className="site-thumb">
              <a href={s.url} className="block" data-link={s.roleId} aria-describedby={`site-tip-${s.id}`}>
                <BrowserFrame image={s.image} address={s.domain} alt={`Front page of ${s.domain}`} sizes="72px" thumb />
              </a>
              <span id={`site-tip-${s.id}`} role="tooltip" className="site-tip">
                <span className="block font-semibold text-ink">{s.name}</span>
                <span className="block">{s.note}</span>
                <span className="block font-mono text-[12px]">
                  {s.domain}
                  {role ? ` · ${period(role)}` : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/*
  The Overview on one screen (1024x640 and up): a 12-column grid.
  Row 1, the four headline figures, which are also the tabs of the main card below them: the career
  timeline (14 years), the skills in use year by year (5 years on the React stack), the years by
  kind of work (product teams and independent work), the industries with their live sites.
  Under them, the main card (8 columns) beside a right-hand slot (4) that results, skills and About
  share behind a three-way switch. The client sites are a strip by the title.
  Below desktop the page flows: the figures, the chosen view, then results, skills and About.
  The whole grid is a `.linked` area: a role hovered or focused on the timeline (or a result) lights
  its results and skills.
*/
export default function Home() {
  const facts: [string, string][] = [
    ["Availability", `${cv.availability}, remote (EU)`],
    ["Industries", "Healthcare, fintech, cultural heritage"],
    ["Languages", cv.languages.map((l) => `${l.name} (${l.level.toLowerCase()})`).join(", ")],
    // the two degrees; the Education screen has the whole path, high school first
    ["Education", cv.education.filter((e) => !e.degree.startsWith("High school")).map((e) => e.degree).join("; ")],
  ];
  return (
    <SectionShell title="Overview" lead="Senior frontend engineer, 14 years building software." actions={<SitesStrip />}>
      <LinkedStyles />
      <div className="panel-grid ov linked">
        <KpiStrip className="ov-kpis" />
        <div className="ov-main" data-mode="career">
          <CareerTimeline compact className="ov-tl" />
        </div>
        <div className="ov-main" data-mode="stack">
          <StackMode />
        </div>
        <div className="ov-main" data-mode="kinds">
          <KindsMode />
        </div>
        <div className="ov-main" data-mode="industries">
          <IndustriesMode />
        </div>
        {/* On a desktop the three cards on the right share one slot, behind this switch (radios:
            no JS needed); below desktop it is hidden and all three show, one under the other. */}
        <fieldset className="seg ov-switch">
          <legend className="sr-only">Show in the side panel</legend>
          <label>
            <input type="radio" name="ov-card" value="results" defaultChecked />
            Results
          </label>
          <label>
            <input type="radio" name="ov-card" value="skills" />
            Skills
          </label>
          <label>
            <input type="radio" name="ov-card" value="about" />
            About
          </label>
        </fieldset>
        <ImpactList className="ov-res" />
        <SkillGroups className="ov-skills" />
        <section aria-labelledby="about" className="card card-col ov-about">
          <div className="card-head">
            <h2 id="about" className="card-title">
              About
            </h2>
          </div>
          <div className="scroll-y" tabIndex={0} role="region" aria-label="About, scrollable">
            <p className="text-[15px] leading-relaxed">{cv.about}</p>
            <dl className="mt-4 grid gap-px overflow-hidden rounded-lg bg-rule">
              {facts.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 bg-raised px-3 py-2">
                  <dt className="text-[13px] text-muted">{k}</dt>
                  <dd className="text-[14px]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </SectionShell>
  );
}
