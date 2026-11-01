import Link from "next/link";
import { BrowserFrame } from "@/components/BrowserFrame";
import { CareerTimeline } from "@/components/CareerTimeline";
import { ImpactList } from "@/components/ImpactList";
import { KpiStrip } from "@/components/KpiStrip";
import { SectionShell } from "@/components/SectionShell";
import { SkillGroups } from "@/components/SkillGroups";
import { ArrowRightIcon } from "@/components/icons";
import { cv } from "@/content/cv";
import { period } from "@/content/career";
import { sites } from "@/content/sites";
import { HOME_DESCRIPTION, pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({ description: HOME_DESCRIPTION, path: "/" });

/*
  Grid: 12 columns, one 20px gap across and down.
  Row 1, the KPI strip, full width. Row 2, the career timeline (7) beside the results (5).
  Row 3, skills by first dated use, full width. Row 4, About (5) beside shipped work (7).
*/
export default function Home() {
  const facts: [string, string][] = [
    ["Availability", `${cv.availability}, remote (EU)`],
    ["Industries", "Healthcare, fintech, cultural heritage"],
    ["Languages", cv.languages.map((l) => `${l.name} (${l.level.toLowerCase()})`).join(", ")],
    ["Education", cv.education[0].degree],
  ];
  return (
    <SectionShell
      title="Overview"
      lead="Senior frontend engineer: nine years on the web, the last five on React, Next.js, TypeScript and React Native."
    >
      <KpiStrip />

      <div className="mt-(--gap) grid gap-(--gap) xl:grid-cols-12">
        <div className="xl:col-span-7">
          <CareerTimeline />
        </div>
        <div className="xl:col-span-5">
          <ImpactList />
        </div>
      </div>

      <section aria-labelledby="levels" className="card mt-(--gap)">
        <div className="card-head">
          <h2 id="levels" className="card-title">
            Skills, by first dated use
          </h2>
          <p className="meta">Years count from the first dated role or project on the CV that uses the skill.</p>
        </div>
        <SkillGroups headingLevel="h3" />
      </section>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-12">
        <section aria-labelledby="about" className="card lg:col-span-5">
          <div className="card-head">
            <h2 id="about" className="card-title">
              About
            </h2>
          </div>
          <p className="text-[15px] leading-relaxed">{cv.about}</p>
          <dl className="mt-5 grid gap-px overflow-hidden rounded-lg bg-rule">
            {facts.map(([k, v]) => (
              <div key={k} className="grid gap-1 bg-raised px-3 py-2.5 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-3">
                <dt className="text-[13px] text-muted">{k}</dt>
                <dd className="text-[14px]">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="shipped" className="card lg:col-span-7">
          <div className="card-head">
            <h2 id="shipped" className="card-title">
              Client sites, live
            </h2>
            <Link href="/projects" prefetch={false} className="card-link">
              All projects
              <ArrowRightIcon />
            </Link>
          </div>
          <ul className="grid">
            {sites.map((s, i) => {
              const role = cv.roles.find((r) => r.id === s.roleId);
              return (
                <li key={s.id} className={i > 0 ? "border-t border-rule" : undefined}>
                  <a href={s.url} className="group grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3 py-2.5 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-4">
                    <BrowserFrame image={s.image} address={s.domain} alt={`Front page of ${s.domain}`} sizes="(min-width: 640px) 120px, 88px" thumb />
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-medium group-hover:underline">{s.name}</span>
                      <span className="block truncate text-[13px] text-muted">{s.note}</span>
                      <span className="mt-0.5 flex flex-wrap gap-x-2 text-[12px] text-muted">
                        <span className="font-mono">{s.domain}</span>
                        {role ? <span className="tnum">· {period(role)}</span> : null}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </SectionShell>
  );
}
