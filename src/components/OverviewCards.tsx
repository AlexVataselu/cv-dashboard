import type { CSSProperties } from "react";
import { cv } from "@/content/cv";
import { AS_OF, FIRST_YEAR } from "@/content/career";
import { deriveAllSkillLevels } from "@/content/skillLevels";

const YEARS = Array.from({ length: AS_OF - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);
const yy = (y: number) => `’${String(y).slice(2)}`;

/**
 * The skills on the CV in use each year, as columns on the career's years, the years since React
 * arrived in gold. A skill counts in a year its dated spans cover (the spans the Skills screen
 * draws); in the CV's own year, the skills its new projects use count too. Hovering or focusing a
 * year reads what it held and what was new in it, in the line under the chart.
 */
export function StackCard({ className }: { className?: string }) {
  const levels = deriveAllSkillLevels(cv);
  const since = Math.min(...["react", "nextjs", "react-native"].map((id) => levels[id]?.since ?? AS_OF));
  const newProjects = cv.projects.filter((p) => p.start === AS_OF);
  const inUse = (y: number) =>
    cv.skills.filter((s) => {
      const spanned = levels[s.id]?.spans.some((x) => x.start <= y && (y < x.end || (x.end === AS_OF && y === AS_OF)));
      return spanned || (y === AS_OF && newProjects.some((p) => p.skillIds.includes(s.id)));
    }).length;
  const newIn = (y: number) =>
    cv.skills.filter((s) => {
      const l = levels[s.id];
      if (l?.since != null) return l.since === y;
      return y === AS_OF && newProjects.some((p) => p.skillIds.includes(s.id));
    });
  const counts = YEARS.map(inUse);
  const top = Math.ceil((Math.max(...counts) + 1) / 10) * 10;

  const css = YEARS.map(
    (y) =>
      `.st:has(.st-col[data-y="${y}"]:is(:hover,:focus-visible)) .st-read[data-y="${y}"]{display:block}` +
      `.st:has(.st-col[data-y="${y}"]:is(:hover,:focus-visible)) .st-read[data-y="idle"]{display:none}`,
  ).join("");

  return (
    <section aria-labelledby="stack-title" className={`card card-col st ${className ?? ""}`}>
      <style href="ov-stack" precedence="medium">
        {css}
      </style>
      <div className="card-head mb-1!">
        <h2 id="stack-title" className="card-title">
          Skills in use, by year
        </h2>
        <p className="meta">
          <span className="st-key st-key-now" aria-hidden="true" />
          {since}+
        </p>
      </div>
      <div className="st-plot" style={{ "--top": top } as CSSProperties}>
        <div className="st-grid" aria-hidden="true">
          {[0, top / 2, top].map((t) => (
            <span key={t} style={{ bottom: `${(t / top) * 100}%` }}>
              <span className="tnum">{t}</span>
            </span>
          ))}
        </div>
        <ol className="st-cols" aria-label="Skills in use each year">
          {YEARS.map((y, i) => (
            <li
              key={y}
              className="st-col"
              data-y={y}
              data-now={y >= since ? "" : undefined}
              tabIndex={0}
              aria-label={`${y}: ${counts[i]} skills in use${newIn(y).length ? `; new: ${newIn(y).map((s) => s.name).join(", ")}` : ""}`}
            >
              <span className="st-bar" style={{ height: `${(counts[i] / top) * 100}%`, "--i": i } as CSSProperties}>
                <span className="st-n tnum">{counts[i]}</span>
              </span>
              <span className="st-y tnum" aria-hidden="true">
                {i === 0 || y === AS_OF || y === since ? yy(y) : ""}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="st-readout" aria-hidden="true">
        <p className="st-read" data-y="idle">
          <b className="tnum">{AS_OF}</b>: {counts.at(-1)} in use; hover a year for what was new
        </p>
        {YEARS.map((y, i) => (
          <p key={y} className="st-read" data-y={y}>
            <b className="tnum">{y}</b>: {counts[i]} in use
            {newIn(y).length ? (
              <>
                , new: <span className="text-ink">{newIn(y).map((s) => s.name.replace(/ \(.*\)$/, "")).join(", ")}</span>
              </>
            ) : null}
          </p>
        ))}
      </div>
    </section>
  );
}
