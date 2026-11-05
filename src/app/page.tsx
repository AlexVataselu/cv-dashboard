import { BrowserFrame } from "@/components/BrowserFrame";
import { CareerLadder } from "@/components/CareerLadder";
import { ImpactList } from "@/components/ImpactList";
import { KpiStrip } from "@/components/KpiStrip";
import { IndustriesCard, KindsCard, StackCard } from "@/components/OverviewCards";
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
  The Overview on one screen (1024x640 and up), everything in view at once, on a 12-column grid:
  the four headline figures across the top; the career timeline (6) beside the results (3), with
  the skills in use by year over the kinds of work in the last column (3); then the skills (6),
  About (3) and the industries with their live sites (3). On a short screen the panel scrolls
  rather than hiding anything. Below desktop the cards flow one under the other.
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
        <CareerLadder variant="overview" className="ov-tl" />
        <StackCard className="ov-stack" />
        <KindsCard className="ov-kinds" />
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
        <IndustriesCard className="ov-ind" />
      </div>
    </SectionShell>
  );
}
