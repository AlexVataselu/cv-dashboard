import { BrowserFrame } from "@/components/BrowserFrame";
import { CareerTimeline } from "@/components/CareerTimeline";
import { ImpactList } from "@/components/ImpactList";
import { KpiStrip } from "@/components/KpiStrip";
import { LinkedStyles } from "@/components/LinkedStyles";
import { SectionShell } from "@/components/SectionShell";
import { SkillGroups } from "@/components/SkillGroups";
import { cv } from "@/content/cv";
import { period } from "@/content/career";
import { sites } from "@/content/sites";
import { HOME_DESCRIPTION, pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({ description: HOME_DESCRIPTION, path: "/" });

/** The five client sites as a strip of thumbnails beside the title: each a link to the live site. */
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
  The Overview on one screen (1024x640 and up): a 12-column grid in three rows.
  Row 1, the four headline figures, each opening its breakdown. Row 2, the career timeline (7) beside
  the results (5). Row 3, the skills (7) beside About (5), taking what height is left. Under 820px
  tall the timeline takes rows 2 and 3, and results, skills and About share the right-hand slot
  behind a three-way switch. The client sites are a strip by the title.
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
        <CareerTimeline compact className="ov-tl span-7" />
        {/* On a short laptop screen (under 820px tall) the three cards on the right share one slot,
            behind this switch (radios: no JS needed); on a taller screen it is hidden and all show. */}
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
        <ImpactList className="ov-res span-5" />
        <SkillGroups className="ov-skills span-7" />
        <section aria-labelledby="about" className="card card-col ov-about span-5">
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
