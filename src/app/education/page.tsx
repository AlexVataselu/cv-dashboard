import { SectionShell } from "@/components/SectionShell";
import { cv } from "@/content/cv";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Education",
  description: "Degrees and spoken languages of Alex Vataselu, Senior Frontend Engineer.",
  path: "/education",
});

/* One row at desktop width: the degrees card spans two of three columns, the languages card one. */
export default function EducationPage() {
  return (
    <SectionShell
      current="education"
      title="Education"
      lead="Two degrees from the Romanian American University in Bucharest, and the two languages I work in."
    >
      <div className="mt-6 grid gap-(--gap) xl:grid-cols-3">
        <section aria-labelledby="degrees" className="card xl:col-span-2">
          <div className="card-head">
            <h2 id="degrees" className="card-title">
              Degrees
            </h2>
          </div>
          <ul className="grid gap-(--gap) sm:grid-cols-2">
            {cv.education.map((e) => (
              <li key={e.degree} className="rounded-lg bg-raised p-4">
                <p className="text-[18px] font-semibold leading-snug">{e.degree}</p>
                <p className="mt-1 text-[14px] text-muted">{e.school}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="languages" className="card">
          <div className="card-head">
            <h2 id="languages" className="card-title">
              Languages
            </h2>
          </div>
          <ul className="grid">
            {cv.languages.map((l, i) => (
              <li
                key={l.name}
                className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 ${i > 0 ? "border-t border-rule" : "pt-0"}`}
              >
                <p className="text-[15px] font-medium">{l.name}</p>
                <p className={`pill ${l.level === "Native" ? "pill-positive" : ""}`}>{l.level}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SectionShell>
  );
}
