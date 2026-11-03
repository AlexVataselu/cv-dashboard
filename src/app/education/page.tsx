import Link from "next/link";
import { SectionShell } from "@/components/SectionShell";
import { cv } from "@/content/cv";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Education",
  description: "Education and spoken languages of Alex Vataselu, Senior Frontend Engineer: high school in mathematics and computer science, then a bachelor's and a master's at the Romanian American University in Bucharest.",
  path: "/education",
});

/** "Master's, IT Economics" reads as its stage ("Master's") and its field ("IT Economics"). */
const split = (degree: string) => {
  const [stage, ...field] = degree.split(", ");
  return { stage, field: field.join(", ") };
};

/*
  One screen: the path (7 columns), high school to the master's, read top to bottom as it happened,
  beside the languages and the work that came before the CV's dated roles (5). The CV gives no years
  for any of it, so none is shown.
*/
export default function EducationPage() {
  const path = [...cv.education].reverse();
  const first = cv.roles.at(-1)!;
  return (
    <SectionShell
      title="Education"
      lead="Mathematics and computer science in high school, then two degrees at the Romanian American University in Bucharest."
    >
      <div className="panel-grid ed">
        <section aria-labelledby="path" className="card card-col span-7">
          <div className="card-head">
            <h2 id="path" className="card-title">
              The path
            </h2>
            <p className="meta">Oldest first</p>
          </div>
          <ol className="ed-path">
            {path.map((e) => {
              const { stage, field } = split(e.degree);
              return (
                <li key={e.degree} className="ed-step">
                  <span className="ed-node" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-muted">{stage}</p>
                    <p className="mt-0.5 text-[20px] font-semibold leading-snug">{field}</p>
                    <p className="mt-1 text-[14px] text-muted">{e.school}</p>
                  </div>
                </li>
              );
            })}
            {/* Where the path led: the dated career, which the Experience screen draws. */}
            <li className="ed-step" data-work="">
              <span className="ed-node" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-muted">Then work</p>
                <p className="mt-0.5 text-[20px] font-semibold leading-snug">
                  {cv.glance[0].value} {cv.glance[0].label}
                </p>
                <p className="mt-1 text-[14px] text-muted">
                  From the first web role, at {first.company}, to {cv.title.toLowerCase()} today.{" "}
                  <Link href="/experience" prefetch={false} className="card-link">
                    See the timeline
                  </Link>
                </p>
              </div>
            </li>
          </ol>
        </section>

        <div className="card-col gap-(--gap) span-5">
          <section aria-labelledby="languages" className="card">
            <div className="card-head">
              <h2 id="languages" className="card-title">
                Languages
              </h2>
              <p className="meta">{cv.languages.length} I work in</p>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-lg bg-rule">
              {cv.languages.map((l) => (
                <li key={l.name} className="grid gap-1 bg-raised px-4 py-3.5">
                  <p className="text-[18px] font-semibold leading-tight">{l.name}</p>
                  <p className="text-[14px] text-muted">{l.level}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="earlier" className="card card-col flex-1">
            <div className="card-head">
              <h2 id="earlier" className="card-title">
                Before the dated roles
              </h2>
            </div>
            <p className="text-[15px] font-medium">{cv.earlier}</p>
            {cv.earlierDetail ? <p className="mt-1 text-[14px] text-muted">{cv.earlierDetail}</p> : null}
            <p className="mt-3 text-[13px] text-muted">The CV gives it no dates; it comes before the first web role.</p>
          </section>
        </div>
      </div>
    </SectionShell>
  );
}
