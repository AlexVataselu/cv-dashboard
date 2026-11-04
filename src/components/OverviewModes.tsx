import type { CSSProperties, ReactNode } from "react";
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
  overlapSpan,
  period,
  roleEnd,
  type WorkKind,
} from "@/content/career";
import { deriveAllSkillLevels } from "@/content/skillLevels";
import { sites } from "@/content/sites";
import { BrowserFrame } from "@/components/BrowserFrame";

const yrs = (n: number) => `${n} ${n === 1 ? "yr" : "yrs"}`;
const YEARS = Array.from({ length: AS_OF - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);

/** The skills behind the second figure ("5 years on React, Next.js, TypeScript and React Native"). */
export const STACK = ["react", "nextjs", "typescript", "react-native"];
const skillName = (id: string) => cv.skills.find((s) => s.id === id)!.name.replace(/ \(.*\)$/, "");

/** One line of a list: a key in the kind's hue, a name with a note, and its figure on the right. */
function Line({ kind, name, figure, note }: { kind?: string; name: ReactNode; figure: string; note?: string }) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-1.5" data-kind={kind}>
      <span className="flex min-w-0 items-baseline gap-2">
        {kind ? <span className="key size-2.5! shrink-0 self-center" aria-hidden="true" /> : <span className="ov-proj-key" aria-hidden="true" />}
        <span className="min-w-0">
          <span className="block truncate text-[14px]">{name}</span>
          {note ? <span className="block truncate text-[13px] text-muted">{note}</span> : null}
        </span>
      </span>
      <span className="tnum text-[13px] text-muted">{figure}</span>
    </li>
  );
}

function ModeHead({ id, title, meta }: { id: string; title: string; meta?: ReactNode }) {
  return (
    <div className="card-head">
      <h2 id={id} className="card-title">
        {title}
      </h2>
      {meta ? <p className="meta tnum">{meta}</p> : null}
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------- */

/**
 * "5 years on React, Next.js, TypeScript and React Native": the skills on the CV in use each year,
 * as columns on the career's years, the years since that stack arrived in gold. A skill counts in a
 * year its dated spans cover (the same spans the Skills screen draws); in the CV's own year, the
 * skills its new projects use count too. Hovering or focusing a year reads what it held and what
 * was new in it.
 */
function StackMode() {
  const levels = deriveAllSkillLevels(cv);
  // the stack arrives with React (TypeScript is older, from 2017): the figure's five years
  const since = Math.min(...["react", "nextjs", "react-native"].map((id) => levels[id]?.since ?? AS_OF));
  const newProjects = cv.projects.filter((p) => p.start === AS_OF);
  const inUse = (y: number) =>
    cv.skills.filter((s) => {
      const l = levels[s.id];
      const spanned = l?.spans.some((x) => x.start <= y && (y < x.end || (x.end === AS_OF && y === AS_OF)));
      return spanned || (y === AS_OF && newProjects.some((p) => p.skillIds.includes(s.id)));
    });
  const newIn = (y: number) =>
    cv.skills.filter((s) => {
      const l = levels[s.id];
      if (l?.since != null) return l.since === y;
      return y === AS_OF && newProjects.some((p) => p.skillIds.includes(s.id));
    });
  const counts = YEARS.map((y) => inUse(y).length);
  const top = Math.ceil((Math.max(...counts) + 1) / 10) * 10;
  const ticks = Array.from({ length: top / 10 + 1 }, (_, i) => i * 10);
  const used = [...cv.roles, ...cv.projects]
    .filter((r) => r.start >= since && STACK.some((id) => r.skillIds.includes(id)))
    .sort((a, b) => a.start - b.start);

  const css = YEARS.map(
    (y) =>
      `.st:has(.st-col[data-y="${y}"]:is(:hover,:focus-visible)) .st-read[data-y="${y}"]{display:block}` +
      `.st:has(.st-col[data-y="${y}"]:is(:hover,:focus-visible)) .st-read[data-y="idle"]{display:none}`,
  ).join("");

  return (
    <section aria-labelledby="mode-stack-title" className="card card-col">
      <style href="ov-stack" precedence="medium">
        {css}
      </style>
      <ModeHead id="mode-stack-title" title="Skills in use, year by year" meta={`${STACK.map(skillName).join(", ")} since ${since}`} />
      <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px]" aria-label="Key">
        <li className="flex items-center gap-2">
          <span className="st-key st-key-now" aria-hidden="true" />
          {since} to now: the {STACK.map(skillName).join(", ")} years
        </li>
        <li className="flex items-center gap-2">
          <span className="st-key" aria-hidden="true" />
          Before {since}
        </li>
      </ul>
      <div className="st">
        <div className="st-plot" style={{ "--top": top } as CSSProperties}>
          <div className="st-grid" aria-hidden="true">
            {ticks.map((t) => (
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
                  {y % 2 === 0 || y === AS_OF ? `’${String(y).slice(2)}` : ""}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="st-readout" aria-hidden="true">
          <p className="st-read" data-y="idle">
            <b className="tnum">{AS_OF}</b>: {counts.at(-1)} skills in use. Hover or focus a year to see what it held and
            what was new.
          </p>
          {YEARS.map((y, i) => (
            <p key={y} className="st-read" data-y={y}>
              <b className="tnum">{y}</b>: {counts[i]} in use
              {newIn(y).length ? (
                <>
                  ; new: <span className="text-ink">{newIn(y).map((s) => s.name).join(", ")}</span>
                </>
              ) : (
                "; nothing new dated"
              )}
            </p>
          ))}
        </div>
      </div>
      <h3 className="mt-3 text-[13px] font-medium text-muted">Where that stack was used</h3>
      <ul className="scroll-y st-used mt-1 grid content-start divide-y divide-(--rule)">
        {used.map((r) =>
          "company" in r ? (
            <Line
              key={r.id}
              kind={kindOf(r.id)}
              name={companyShort(r)}
              note={STACK.filter((id) => r.skillIds.includes(id)).map(skillName).join(", ")}
              figure={period(r)}
            />
          ) : (
            <Line
              key={r.id}
              name={r.title.split(", ")[0]}
              note={STACK.filter((id) => r.skillIds.includes(id)).map(skillName).join(", ")}
              figure={r.label}
            />
          ),
        )}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------------------------------------- */

/**
 * "2 product teams plus independent work": the career's years by kind of work, as one 100% bar of
 * role-years, then year by year (each year split between the kinds of the roles it held), then
 * each kind with its roles.
 */
function KindsMode() {
  const { years, overlap } = careerTotals();
  const shared = overlapSpan();
  const total = KINDS.reduce((s, k) => s + kindYears(k), 0);
  const roles = [...cv.roles].sort((a, b) => b.start - a.start);
  const kindsIn = (y: number): WorkKind[] =>
    KINDS.filter((k) => cv.roles.some((r) => kindOf(r.id) === k && r.start <= y && (y < roleEnd(r, AS_OF) || (r.end === "now" && y === AS_OF))));
  return (
    <section aria-labelledby="mode-kinds-title" className="card card-col">
      <ModeHead
        id="mode-kinds-title"
        title="Years by kind of work"
        meta={`${yrs(total)} of roles in ${yrs(years)}${shared ? `, ${shared.start}–${shared.end} side by side` : ""}`}
      />
      <ol className="kb" aria-label="Role-years by kind of work">
        {KINDS.map((k) => (
          <li key={k} data-kind={k} style={{ flexGrow: kindYears(k) } as CSSProperties}>
            <span className="kb-name">{KIND_LABEL[k]}</span>
            <span className="kb-n tnum">{yrs(kindYears(k))}</span>
          </li>
        ))}
      </ol>

      <h3 className="mt-4 text-[13px] font-medium text-muted">Year by year</h3>
      <ol className="ky mt-1" aria-label="The kind of work in each year">
        {YEARS.map((y) => {
          const ks = kindsIn(y);
          return (
            <li key={y} aria-label={`${y}: ${ks.map((k) => KIND_LABEL[k]).join(" and ") || "none"}`}>
              <span className="ky-cell">
                {ks.map((k) => (
                  <span key={k} data-kind={k} />
                ))}
              </span>
              <span className="ky-y tnum" aria-hidden="true">
                {y % 2 === 0 || y === AS_OF ? `’${String(y).slice(2)}` : ""}
              </span>
            </li>
          );
        })}
      </ol>

      <ul className="scroll-y mt-4 grid content-start gap-3 kl">
        {KINDS.map((k) => (
          <li key={k} data-kind={k} className="kl-kind">
            <p className="flex items-center gap-2 text-[14px] font-semibold">
              <span className="key" aria-hidden="true" />
              {KIND_LABEL[k]}
              <span className="tnum ml-auto text-[13px] font-normal text-muted">{yrs(kindYears(k))}</span>
            </p>
            <ul className="mt-0.5 pl-5">
              {roles
                .filter((r) => kindOf(r.id) === k)
                .map((r) => (
                  <li key={r.id} className="flex justify-between gap-3 text-[13px]">
                    <span className="truncate">
                      {companyShort(r)} <span className="text-muted">· {r.title}</span>
                    </span>
                    <span className="tnum shrink-0 text-muted">{period(r)}</span>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
      {overlap ? (
        <p className="mt-2 border-t border-rule pt-2 text-[13px] text-muted">
          The kinds add up to {yrs(total)}: {shared ? `${shared.start}–${shared.end}` : ""} held two roles at once, so the
          career counts {yrs(years)}.
        </p>
      ) : null}
    </section>
  );
}

/* ---------------------------------------------------------------------------------------------- */

/**
 * "3 industries": each industry with the roles behind it and the live sites shipped in it (real
 * screenshots, each a link to the site). Fintech has no public site on the CV: it says so.
 */
function IndustriesMode() {
  const role = (id: string) => cv.roles.find((r) => r.id === id)!;
  const industries: { name: string; roleIds: string[]; siteIds: string[]; note?: string }[] = [
    { name: "Healthcare", roleIds: ["freelance-2021"], siteIds: ["recuperareacasa", "eyeexcellence", "orlrasnov"] },
    {
      name: "Fintech",
      roleIds: ["freelance-2021"],
      siteIds: [],
      note: "Named on the CV for the 2021–2023 freelance work, with no public site to show.",
    },
    {
      name: "Cultural heritage",
      roleIds: ["freelance-2021", "freelance-2025"],
      siteIds: ["arhivelelitoralului", "azuga365", "litoralinlucru"],
    },
  ];
  return (
    <section aria-labelledby="mode-ind-title" className="card card-col">
      <ModeHead id="mode-ind-title" title="Three industries, with the sites shipped" meta={`${sites.length} live client sites`} />
      <div className="scroll-y ind mt-1">
        {industries.map((ind) => (
          <section key={ind.name} aria-labelledby={`ind-${ind.name}`} className="ind-col">
            <h3 id={`ind-${ind.name}`} className="text-[15px] font-semibold">
              {ind.name}
            </h3>
            <p className="tnum text-[13px] text-muted" data-kind="indie">
              {ind.roleIds.map((id) => `${companyShort(role(id))} ${period(role(id))}`).join(" · ")}
            </p>
            {ind.siteIds.length ? (
              <ul className="mt-2 grid gap-2">
                {ind.siteIds.map((id) => {
                  const s = sites.find((x) => x.id === id)!;
                  return (
                    <li key={id}>
                      <a href={s.url} className="ind-site" data-link={s.roleId}>
                        <BrowserFrame image={s.image} address={s.domain} alt={`Front page of ${s.domain}`} sizes="(min-width: 1024px) 240px, 90vw" thumb />
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold text-ink">{s.name}</span>
                          <span className="block truncate font-mono text-[12px] text-muted">{s.domain}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="ind-empty mt-2 text-[13px] text-muted">{ind.note}</p>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}

export { StackMode, KindsMode, IndustriesMode };
