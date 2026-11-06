import { CareerLadder } from "@/components/CareerLadder";
import { ImpactList } from "@/components/ImpactList";
import { KpiStrip } from "@/components/KpiStrip";
import { StackCard } from "@/components/OverviewCards";
import { LinkedStyles } from "@/components/LinkedStyles";
import { SectionShell } from "@/components/SectionShell";
import { SkillGroups } from "@/components/SkillGroups";
import { cv } from "@/content/cv";
import { HOME_DESCRIPTION, pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  description: HOME_DESCRIPTION,
  path: "/",
});

/*
  The Overview, as a page that scrolls inside the panel when it must (it no longer squeezes every
  card into one screen and clips them):
  1. the four headline figures;
  2. the results, as the hero: the CV's own beside the ones measured on the work;
  3. the career ladder, with the skills in use by year and About beside it;
  4. the skills.
  The whole grid is a `.linked` area: a role hovered or focused on the ladder (or a result) lights
  its results and skills.
*/
export default function Home() {
  const facts: [string, string][] = [
    ["Availability", `${cv.availability}, remote (EU)`],
    ["Industries", "Healthcare, fintech, cultural heritage"],
    [
      "Languages",
      cv.languages
        .map((l) => `${l.name} (${l.level.toLowerCase()})`)
        .join(", "),
    ],
    // the two degrees; the Education screen has the whole path, high school first
    [
      "Education",
      cv.education
        .filter((e) => !e.degree.startsWith("High school"))
        .map((e) => e.degree)
        .join("; "),
    ],
  ];
  return (
    <SectionShell
      title="Overview"
      lead="Senior frontend engineer, 14 years building software."
    >
      <LinkedStyles />
      <div className="panel-grid ov linked">
        <KpiStrip className="ov-kpis" />
        <ImpactList className="ov-res" />
        <CareerLadder variant="overview" className="ov-tl" />
        <StackCard className="ov-stack" />
        <SkillGroups className="ov-skills" />
        <section aria-labelledby="about" className="card card-col ov-about">
          <div className="card-head">
            <h2 id="about" className="card-title">
              About
            </h2>
          </div>
          <div
            className="scroll-y"
            tabIndex={0}
            role="region"
            aria-label="About, scrollable"
          >
            <p className="text-[15px] leading-relaxed">{cv.about}</p>
            <dl className="mt-4 grid gap-px overflow-hidden rounded-lg bg-rule">
              {facts.map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 bg-raised px-3 py-2"
                >
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
