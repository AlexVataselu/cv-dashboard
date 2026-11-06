import type { CSSProperties } from "react";
import { cv } from "@/content/cv";
import {
  AS_OF,
  FIRST_YEAR,
  KINDS,
  KIND_LABEL,
  careerTotals,
  companyShort,
  kindOf,
  kindYears,
  period,
  roleEnd,
  type WorkKind,
} from "@/content/career";
import { deriveAllSkillLevels } from "@/content/skillLevels";
import { sites } from "@/content/sites";
import { BrowserFrame } from "@/components/BrowserFrame";

const yrs = (n: number) => `${n} ${n === 1 ? "yr" : "yrs"}`;
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
              data-years={y}
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
          <p key={y} className="st-read" data-y={y} data-years={y}>
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

/**
 * The career's years by kind of work: one 100% bar of role-years, the kind held in each year, and
 * each kind's years. Every role and its years come from the CV; the overlap is named.
 */
export function KindsCard({ className }: { className?: string }) {
  const { years } = careerTotals();
  const total = KINDS.reduce((s, k) => s + kindYears(k), 0);
  const kindsIn = (y: number): WorkKind[] =>
    KINDS.filter((k) =>
      cv.roles.some((r) => kindOf(r.id) === k && r.start <= y && (y < roleEnd(r, AS_OF) || (r.end === "now" && y === AS_OF))),
    );
  return (
    <section aria-labelledby="kinds-title" className={`card card-col ${className ?? ""}`}>
      <div className="card-head mb-2!">
        <h2 id="kinds-title" className="card-title">
          Kinds of work
        </h2>
        <p className="meta tnum" title={`${yrs(total)} of roles in ${yrs(years)}: two roles ran side by side`}>
          {total} in {years} yrs
        </p>
      </div>
      <ol className="ky" aria-label="The kind of work in each year">
        {YEARS.map((y, i) => {
          const ks = kindsIn(y);
          return (
            <li key={y} data-y={y} data-years={y} aria-label={`${y}: ${ks.map((k) => KIND_LABEL[k]).join(" and ") || "none"}`}>
              <span className="ky-cell">
                {ks.map((k) => (
                  <span key={k} data-kind={k} />
                ))}
              </span>
              <span className="ky-y tnum" aria-hidden="true">
                {i === 0 || y === AS_OF || y === 2017 || y === 2021 ? yy(y) : ""}
              </span>
            </li>
          );
        })}
      </ol>
      <ul className="kl mt-2">
        {KINDS.map((k) => (
          <li key={k} data-kind={k}>
            <span className="key size-2.5!" aria-hidden="true" />
            <span className="truncate">{KIND_LABEL[k]}</span>
            <span className="kl-roles truncate text-muted">
              {cv.roles
                .filter((r) => kindOf(r.id) === k)
                .map((r) => companyShort(r))
                .filter((n, i, a) => a.indexOf(n) === i)
                .join(", ")}
            </span>
            <span className="tnum ml-auto shrink-0 text-muted">{yrs(kindYears(k))}</span>
          </li>
        ))}
      </ul>

    </section>
  );
}

/**
 * The three industries, each with the roles behind it and the live client sites shipped in it (real
 * screenshots, each a link). Fintech has no public site on the CV: it says so.
 */
export const INDUSTRIES: { name: string; roleIds: string[]; siteIds: string[] }[] = [
  { name: "Healthcare", roleIds: ["freelance-2021"], siteIds: ["recuperareacasa", "eyeexcellence", "orlrasnov"] },
  { name: "Fintech", roleIds: ["freelance-2021"], siteIds: [] },
  { name: "Cultural heritage", roleIds: ["freelance-2021", "freelance-2025"], siteIds: ["arhivelelitoralului", "azuga365", "litoralinlucru"] },
];

export function IndustriesCard({ className }: { className?: string }) {
  const role = (id: string) => cv.roles.find((r) => r.id === id)!;
  const industries = INDUSTRIES;
  return (
    <section aria-labelledby="ind-title" className={`card card-col ${className ?? ""}`}>
      <div className="card-head mb-1!">
        <h2 id="ind-title" className="card-title">
          Industries
        </h2>
        <p className="meta tnum">{sites.length} live sites</p>
      </div>
      <ul className="scroll-y grid content-start">
        {industries.map((ind) => (
          <li key={ind.name} className="ind-row" data-kind="indie">
            <p className="flex items-baseline justify-between gap-2">
              <span className="text-[14px] font-semibold">{ind.name}</span>
              <span className="tnum truncate text-[12px] text-muted">
                {[...new Set(ind.roleIds.map((id) => period(role(id))))].join(", ")}
              </span>
            </p>
            {ind.siteIds.length ? (
              <ul className="ind-sites mt-1">
                {ind.siteIds.map((id) => {
                  const s = sites.find((x) => x.id === id)!;
                  return (
                    <li key={id}>
                      <a
                        href={s.url}
                        className="ind-site"
                        data-link={s.roleId}
                        data-name={s.name}
                        data-domain={s.domain}
                        data-note={s.note}
                        data-period={period(role(s.roleId))}
                      >
                        <BrowserFrame image={s.image} address={s.domain} alt={`${s.name}, ${s.domain}`} sizes="80px" thumb />
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-0.5 text-[12px] text-muted">
                {companyShort(role(ind.roleIds[0]))} work named on the CV; no public site.
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
