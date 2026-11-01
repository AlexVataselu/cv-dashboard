import type { CSSProperties } from "react";
import { cv } from "@/content/cv";
import {
  AS_OF,
  FIRST_YEAR,
  KIND_LABEL,
  companyShort,
  kindOf,
  period,
  roleEnd,
  roleYears,
  type WorkKind,
} from "@/content/career";
import { deriveSkillLevel } from "@/content/skillLevels";

const yrs = (n: number) => `${n} ${n === 1 ? "yr" : "yrs"}`;

/**
 * Every dated role on the CV as a bar on one time axis, oldest at the top, coloured by the kind of
 * work. Under the roles, the span since React, Next.js and TypeScript first appear on the CV. Drawn
 * as plain HTML at build time: it costs no client JS, and every bar's text is real text.
 */
export function CareerTimeline({ headingLevel = "h2" }: { headingLevel?: "h2" | "h3" }) {
  const now = AS_OF;
  const span = now - FIRST_YEAR;
  const pct = (year: number) => `${((year - FIRST_YEAR) / span) * 100}%`;
  const roles = [...cv.roles].sort((a, b) => a.start - b.start);
  const years = Array.from({ length: span + 1 }, (_, i) => FIRST_YEAR + i);

  const byKind = (k: WorkKind) =>
    roles.filter((r) => kindOf(r.id) === k).reduce((sum, r) => sum + roleYears(r, now), 0);
  const kinds: WorkKind[] = ["product", "indie", "shop"];
  const total = roles.reduce((sum, r) => sum + roleYears(r, now), 0);

  const react = deriveSkillLevel("react", cv, now);
  const reactSince = react.since ?? now;

  const Heading = headingLevel;
  // One set of year lines behind every row (the roles and the React span), not one per row.
  const lines = (
    <span className="tl-lines" aria-hidden="true" style={{ gridColumn: 2, gridRow: `1 / ${roles.length + 2}` }}>
      {years.map((y, i) => (
        <span key={y} style={{ left: pct(y), transform: i === span ? "translateX(-1px)" : undefined }} />
      ))}
    </span>
  );

  return (
    <figure className="card" aria-labelledby="career-title">
      <div className="card-head">
        <Heading id="career-title" className="card-title">
          Career, {FIRST_YEAR} to now
        </Heading>
        <p className="meta tnum">{yrs(total)} in dated roles</p>
      </div>
      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-[13px]" aria-label="Kinds of work, with years">
        {kinds.map((k) => (
          <li key={k} className="flex items-center gap-2" data-kind={k}>
            <span className="key" aria-hidden="true" />
            <span>{KIND_LABEL[k]}</span>
            <span className="tnum text-muted">{yrs(byKind(k))}</span>
          </li>
        ))}
      </ul>

      <div className="tl tl-years">
        {lines}
        {roles.map((r) => {
          const k = kindOf(r.id);
          const n = roleYears(r, now);
          const style = { left: pct(r.start), width: `calc(${pct(roleEnd(r, now))} - ${pct(r.start)})` } as CSSProperties;
          return (
            <div key={r.id} className="contents">
              <div className="tl-label">
                <span>{companyShort(r)}</span>
                <span className="tnum">{period(r)}</span>
              </div>
              <div className="tl-track">
                <span className="tl-bar tnum" data-kind={k} style={style} title={`${KIND_LABEL[k]}, ${period(r)}`}>
                  <span className="sr-only">{KIND_LABEL[k]}, </span>
                  <span className="tl-bar-text">{yrs(n)}</span>
                </span>
              </div>
            </div>
          );
        })}
        <div className="tl-label mt-1 border-t border-rule pt-1">
          <span>React, Next.js, TS</span>
          <span className="tnum">
            {reactSince}–now · {yrs(now - reactSince)}
          </span>
        </div>
        <div className="tl-track mt-1 border-t border-rule pt-1">
          <span className="tl-span" style={{ left: pct(reactSince), right: 0 }} aria-hidden="true" />
        </div>
        <div aria-hidden="true" />
        <div className="tl-axis tnum" aria-hidden="true">
          {years.map((y) => (
            <span key={y} style={{ left: pct(y) }}>
              {y}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}
