import type { CSSProperties } from "react";
import Link from "next/link";
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
  roleYears,
} from "@/content/career";
import { deriveSkillLevel } from "@/content/skillLevels";

const yrs = (n: number) => `${n} ${n === 1 ? "yr" : "yrs"}`;

/**
 * Every dated role on the CV as a bar on one time axis, oldest at the top, coloured by the kind of
 * work; then the personal projects; then the span since React, Next.js and TypeScript first appear
 * on the CV. Drawn as plain HTML at build time: it costs no client JS, and every bar's text is real.
 *
 * Each role row is a link, so the timeline is a navigator:
 * - on the Overview (`compact`) it opens the role on Experience; hovering or focusing it lights the
 *   role's skills and results in the cards beside it (CSS :has, see LinkedStyles);
 * - on Experience it opens the role in the side card (RoleNav handles the click; without JS the
 *   link still jumps to the role).
 * Every row and project mark carries `data-skills`, so a selected skill marks the roles and projects
 * that used it (SkillLinks).
 */
export function CareerTimeline({
  headingLevel = "h2",
  compact = false,
  className,
}: {
  headingLevel?: "h2" | "h3";
  compact?: boolean;
  className?: string;
}) {
  const now = AS_OF;
  const span = now - FIRST_YEAR;
  const pct = (year: number) => `${((year - FIRST_YEAR) / span) * 100}%`;
  const roles = [...cv.roles].sort((a, b) => a.start - b.start);
  const years = Array.from({ length: span + 1 }, (_, i) => FIRST_YEAR + i);

  // Each calendar year counts once: the kinds' years, less the years run side by side, are the total.
  const { years: total, overlap } = careerTotals(now);
  const shared = overlapSpan(now);

  const react = deriveSkillLevel("react", cv, now);
  const reactSince = react.since ?? now;
  const projects = [...cv.projects].sort((a, b) => a.start - b.start);
  const rowCount = roles.length + 2;

  const Heading = headingLevel;
  // One set of year lines behind every row, not one per row.
  const lines = (
    <span className="tl-lines" aria-hidden="true" style={{ gridColumn: 2, gridRow: `1 / ${rowCount + 1}` }}>
      {years.map((y, i) => (
        <span key={y} style={{ left: pct(y), transform: i === span ? "translateX(-1px)" : undefined }} />
      ))}
    </span>
  );

  return (
    <figure className={`card card-col ${className ?? ""}`} aria-labelledby="career-title">
      <div className="card-head mb-2!">
        <Heading id="career-title" className="card-title">
          Career, {FIRST_YEAR} to now
        </Heading>
        <p className="meta tnum">
          {yrs(total)} in dated roles{compact && shared ? `, ${shared.start}–${shared.end} side by side` : ""}
        </p>
      </div>
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px]" aria-label="Kinds of work, with years">
        {KINDS.map((k) => (
          <li key={k} className="flex items-center gap-2" data-kind={k}>
            <span className="key" aria-hidden="true" />
            <span>{KIND_LABEL[k]}</span>
            {compact ? null : <span className="tnum text-muted">{yrs(kindYears(k, now))}</span>}
          </li>
        ))}
        {shared && !compact ? (
          <li className="flex items-center gap-2">
            <span>
              Side by side, <span className="tnum">{shared.start}–{shared.end}</span>
            </span>
            <span className="tnum text-muted">−{yrs(overlap)}</span>
          </li>
        ) : null}
      </ul>

      <div className={`tl tl-years ${compact ? "tl-compact" : ""}`}>
        {lines}
        {roles.map((r, i) => {
          const k = kindOf(r.id);
          const n = roleYears(r, now);
          const style = {
            left: pct(r.start),
            width: `calc(${pct(roleEnd(r, now))} - ${pct(r.start)})`,
            "--i": i,
          } as CSSProperties;
          const inner = (
            <>
              <span className="tl-label">
                <span>{companyShort(r)}</span>
                <span className="tnum">{period(r)}</span>
              </span>
              <span className="tl-track">
                <span className="tl-bar tnum" data-kind={k} style={style}>
                  <span className="sr-only">{KIND_LABEL[k]}, </span>
                  <span className="tl-bar-text">{yrs(n)}</span>
                </span>
              </span>
            </>
          );
          const shared = {
            className: "tl-row",
            "data-kind": k,
            "data-link": r.id,
            "data-roles": r.id,
            "data-skills": r.skillIds.join(" "),
            "data-item": "role",
          };
          return compact ? (
            <Link key={r.id} href={`/experience#role-${r.id}`} prefetch={false} {...shared}>
              {inner}
            </Link>
          ) : (
            <a key={r.id} href={`#role-${r.id}`} aria-controls={`role-${r.id}`} data-open-role={r.id} {...shared}>
              {inner}
            </a>
          );
        })}

        {/* The projects row links to Projects as a whole; its three marks are drawing, not targets
            (three 6px lanes cannot each be a 24px target). Each mark still carries its skills. */}
        <Link href="/projects" prefetch={false} className="tl-row mt-1 border-t border-rule pt-1">
          <span className="tl-label">
            <span>Personal projects</span>
            <span className="tnum">{projects.length} since {projects[0].start}</span>
          </span>
          <span className="tl-track">
            <span className="sr-only">: {projects.map((p) => `${p.title.split(", ")[0]}, ${p.label}`).join("; ")}</span>
            <span className="tl-projects" aria-hidden="true">
              {projects.map((p, i) => (
                <span
                  key={p.id}
                  className="tl-proj"
                  title={`${p.title.split(", ")[0]}, ${p.label}`}
                  data-name={p.title.split(", ")[0]}
                  data-skills={p.skillIds.join(" ")}
                  data-item="project"
                  // A project begun in the CV's own year has no length on the axis: a 10px mark ends the row.
                  style={{
                    left: `min(${pct(p.start)}, calc(100% - 10px))`,
                    width: `calc(100% - ${pct(p.start)})`,
                    "--i": roles.length + i,
                  } as CSSProperties}
                />
              ))}
            </span>
          </span>
        </Link>

        <div className="tl-row">
          <span className="tl-label">
            <span>React, Next.js, TS</span>
            <span className="tnum">
              {compact ? (
                `since ${reactSince}`
              ) : (
                <>
                  {reactSince}–now<span className="tl-extra"> · {yrs(now - reactSince)}</span>
                </>
              )}
            </span>
          </span>
          <span className="tl-track">
            <span
              className="tl-span"
              style={{ left: pct(reactSince), right: 0, "--i": rowCount } as CSSProperties}
              aria-hidden="true"
            />
          </span>
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
