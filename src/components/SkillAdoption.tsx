import { cv } from "@/content/cv";
import { AS_OF, FIRST_YEAR } from "@/content/career";
import { deriveAllSkillLevels } from "@/content/skillLevels";

/** Round ticks whose top sits above the largest value. */
function ticks(max: number) {
  const step = max <= 5 ? 1 : max <= 12 ? 2 : 5;
  const top = Math.floor(max / step) * step + step;
  return Array.from({ length: top / step + 1 }, (_, i) => i * step);
}

/**
 * When each skill on the CV first appears in a dated role or project: one column per year, drawn
 * at build time from the same derivation as the skill levels. Years with none stay at zero.
 * Beside it, the same data as a list, so every column can be checked name by name.
 */
export function SkillAdoption() {
  const now = AS_OF;
  const levels = deriveAllSkillLevels(cv, now);
  const years = Array.from({ length: now - FIRST_YEAR }, (_, i) => FIRST_YEAR + i);
  const named = (y: number) => cv.skills.filter((s) => levels[s.id]?.since === y).map((s) => s.name);
  const counts = years.map((y) => named(y).length);
  const dated = counts.reduce((a, b) => a + b, 0);
  const t = ticks(Math.max(...counts));
  const top = t[t.length - 1];

  return (
    <div className="mt-6 grid gap-(--gap) xl:grid-cols-12">
      <figure className="card xl:col-span-7" aria-labelledby="adoption-title">
        <div className="card-head">
          <p id="adoption-title" className="card-title">
            Skills first used, by year
          </p>
          <p className="meta tnum">
            {dated} of {cv.skills.length} skills have a dated first use
          </p>
        </div>
        <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2">
          <div className="relative h-48 text-[12px] text-muted" aria-hidden="true">
            {t.map((v) => (
              <span key={v} className="tnum absolute right-0 -translate-y-1/2" style={{ bottom: `${(v / top) * 100}%`, transform: `translateY(50%)` }}>
                {v}
              </span>
            ))}
          </div>
          <div className="relative h-48">
            {t.map((v) => (
              <span
                key={v}
                aria-hidden="true"
                className={`absolute inset-x-0 h-px ${v === 0 ? "bg-control" : "bg-(--grid)"}`}
                style={{ bottom: `${(v / top) * 100}%` }}
              />
            ))}
            <ol className="absolute inset-0 flex items-end gap-[6%] px-[2%]">
              {years.map((y, i) => (
                <li key={y} className="relative flex h-full flex-1 flex-col justify-end" title={named(y).join(", ") || "None"}>
                  <span className="sr-only">
                    {y}: {counts[i]} {counts[i] === 1 ? "skill" : "skills"}
                  </span>
                  {counts[i] > 0 ? (
                    <>
                      <span aria-hidden="true" className="tnum mb-1 text-center text-[12px] font-semibold">
                        {counts[i]}
                      </span>
                      <span aria-hidden="true" className="block rounded-t-[3px] bg-primary" style={{ height: `${(counts[i] / top) * 100}%` }} />
                    </>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
          <span aria-hidden="true" />
          <div className="flex gap-[6%] px-[2%] pt-2 text-[12px] text-muted" aria-hidden="true">
            {years.map((y, i) => (
              <span key={y} className={`tnum min-w-0 flex-1 whitespace-nowrap text-center ${i % 4 !== 0 ? "max-sm:invisible" : ""} ${i === 0 ? "max-sm:text-left" : ""} ${i === years.length - 1 ? "max-sm:flex max-sm:justify-end" : ""}`}>
                {y}
              </span>
            ))}
          </div>
        </div>
      </figure>

      <section className="card xl:col-span-5" aria-labelledby="adoption-list">
        <div className="card-head">
          <p id="adoption-list" className="card-title">
            Which skills, when
          </p>
          <p className="meta tnum">{cv.skills.length - dated} listed without a date</p>
        </div>
        <ul className="grid">
          {years
            .filter((y) => named(y).length > 0)
            .reverse()
            .map((y, i) => (
              <li key={y} className={`grid grid-cols-[3.25rem_minmax(0,1fr)] gap-3 py-2.5 ${i > 0 ? "border-t border-rule" : "pt-0"}`}>
                <span className="tnum text-[14px] font-semibold">{y}</span>
                <span className="text-[14px] leading-snug">{named(y).join(", ")}</span>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
