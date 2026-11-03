import type { CSSProperties } from "react";
import Link from "next/link";
import { cv } from "@/content/cv";
import { AS_OF, FIRST_YEAR, companyShort, kindOf, period, roleEnd } from "@/content/career";
import { deriveAllSkillLevels, formatLevel, usageIndex } from "@/content/skillLevels";
import { GROUPS, GroupFilter, slug, usageHref } from "@/components/SkillGroups";
import { SkillPicker } from "@/components/SkillPicker";

const SPAN = AS_OF - FIRST_YEAR;
const pct = (year: number) => `${((year - FIRST_YEAR) / SPAN) * 100}%`;
const bar = (start: number, end: number): CSSProperties => ({ left: pct(start), width: `calc(${pct(end)} - ${pct(start)})` });
const YEARS = Array.from({ length: SPAN + 1 }, (_, i) => FIRST_YEAR + i);

/** The year axis and its gridlines, shared by the career strip and every skill row (one scale). */
function Axis() {
  return (
    <div className="sm-axis tnum" aria-hidden="true">
      <span />
      <span className="sm-years">
        {YEARS.map((y) => (
          <span key={y} style={{ left: pct(y) }}>
            {y}
          </span>
        ))}
      </span>
    </div>
  );
}

/**
 * The Skills screen as one interactive view, drawn at build time.
 *
 * Left, "Skills across the career": every skill as a row on the career's year axis, its dated
 * spans drawn as bars (solid while still in use, outlined once the CV shows it ended), under a strip
 * of the roles themselves on the same axis. Hovering or focusing a skill lights the roles and
 * projects that used it in that strip and dims the rest, so a skill's spans read against the career.
 * The group filter (radios, no JS) reflows the rows.
 * Right, the active skill's card: its years, what dates it, and every role and project that used it,
 * each a link that keeps the skill selected there. With nothing active it lists the skills by the
 * year they first appear.
 *
 * Each row is a button: pressing it selects the skill (`?skill=` stays the source of truth), which
 * marks it on Experience, Projects and the Overview too. One SkillPicker island does the hover,
 * selection and arrow-key movement for every row (see SkillPicker); the rest is HTML and CSS: one
 * rule per skill, written from the CV, shows its card and lights its roles. No proficiency is drawn:
 * a bar is only ever a span of years named on the CV.
 */
export function SkillMatrix() {
  const levels = deriveAllSkillLevels(cv);
  const usage = usageIndex(cv);
  const roles = [...cv.roles].sort((a, b) => a.start - b.start);
  const dated = cv.skills.filter((s) => levels[s.id]?.since != null).length;

  // One rule per skill: its card shows, and its roles and projects light in the strip.
  const css = cv.skills
    .map(
      (s) =>
        `.sm[data-active="${s.id}"] [data-detail="${s.id}"]{display:flex}` +
        `.sm[data-active="${s.id}"] .cs-lane[data-skills~="${s.id}"]{opacity:1}` +
        `.sm[data-active="${s.id}"] .cs-lane[data-skills~="${s.id}"] .cs-name{color:var(--ink);font-weight:600}`,
    )
    .join("");

  const firstIn = (y: number) => cv.skills.filter((s) => levels[s.id]?.since === y);
  const byYear = YEARS.filter((y) => firstIn(y).length > 0).reverse();

  return (
    <SkillPicker className="panel-grid sk sm filtered" data-active="none" roving>
      <style href="skill-matrix" precedence="medium">
        {`${css}.sm[data-active="none"] [data-detail="none"]{display:flex}`}
      </style>

      <section aria-labelledby="sm-title" className="card card-col sm-card span-8" style={{ "--span": SPAN } as CSSProperties}>
        <div className="card-head">
          <h2 id="sm-title" className="card-title">
            Skills across the career
          </h2>
          <p className="meta tnum">
            {dated} of {cv.skills.length} skills have a dated first use
          </p>
        </div>
        <GroupFilter name="skills-group" />

        {/* The roles on the same axis as the skills: a skill's spans read against the career. */}
        <div className="sm-head mt-3" aria-hidden="true">
          <ul className="cs">
            {roles.map((r) => (
              <li key={r.id} className="cs-lane" data-kind={kindOf(r.id)} data-skills={r.skillIds.join(" ")}>
                <span className="cs-name">
                  {companyShort(r)} <span className="tnum text-muted">{period(r)}</span>
                </span>
                <span className="sm-track">
                  <span className="cs-bar" style={bar(r.start, roleEnd(r, AS_OF))} />
                </span>
              </li>
            ))}
            <li className="cs-lane" data-skills={[...new Set(cv.projects.flatMap((p) => p.skillIds))].join(" ")}>
              <span className="cs-name">Personal projects</span>
              <span className="sm-track">
                {cv.projects.map((p) => (
                  <span
                    key={p.id}
                    className="cs-proj"
                    title={p.title.split(", ")[0]}
                    style={{ left: `min(${pct(p.start)}, calc(100% - 8px))`, width: `max(8px, calc(100% - ${pct(p.start)}))` }}
                  />
                ))}
              </span>
            </li>
          </ul>
          <Axis />
        </div>

        <div className="scroll-y sm-body" data-flip-root="">
          {GROUPS.map((g) => (
            <section key={g} aria-labelledby={`smg-${slug(g)}`} data-group={slug(g)} data-flip="" className="sm-group">
              <h3 id={`smg-${slug(g)}`} className="sm-group-name">
                {g}
              </h3>
              <ul>
                {cv.skills
                  .filter((s) => s.group === g)
                  .map((s) => {
                    const l = levels[s.id];
                    const text = formatLevel(l);
                    const past = l?.until != null;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          className="sm-row"
                          aria-pressed="false"
                          data-skill={s.id}
                          aria-describedby={`sd-used-${s.id}`}
                        >
                          <span className="sm-name" title={s.name}>{s.name}</span>
                          {text ? (
                            <>
                              {" · "}
                              <span className="sm-level tnum">{text}</span>
                            </>
                          ) : null}
                          <span className="sm-track" aria-hidden="true">
                            {l?.spans.map((x) => (
                              <span key={x.start} className={past ? "sm-span sm-past" : "sm-span"} style={bar(x.start, x.end)} />
                            ))}
                            {/* Used only in a project begun in the CV's own year: a mark at its end, no length. */}
                            {l && l.since == null && l.usedIn.length > 0 ? <span className="sm-dot" /> : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </section>
          ))}
        </div>
        <ul className="sm-key mt-2 border-t border-rule pt-2" aria-label="Key">
          <li>
            <span className="sm-span relative! inline-block h-2 w-5" aria-hidden="true" /> In use
          </li>
          <li>
            <span className="sm-span sm-past relative! inline-block h-2 w-5" aria-hidden="true" /> Ended, on the CV
          </li>
          <li>
            <span className="sm-dot relative! inline-block" aria-hidden="true" /> A {AS_OF} project only
          </li>
        </ul>
      </section>

      <section aria-labelledby="sd-title" className="card card-col sd-card span-4">
        <h2 id="sd-title" className="sr-only">
          The skill in focus
        </h2>
        <div className="sd" data-detail="none">
          <p className="card-title">Pick a skill</p>
          <p className="mt-1 text-[14px] text-muted">
            Hover or focus a row to see where it was used; press it to mark it across Experience, Projects and the
            Overview.
          </p>
          <h3 className="mt-4 text-[13px] font-medium text-muted">First dated use, by year</h3>
          <ul className="scroll-y mt-1 grid content-start" tabIndex={0} aria-label="Skills by the year they first appear">
            {byYear.map((y, i) => (
              <li key={y} className={`grid grid-cols-[3rem_minmax(0,1fr)] gap-3 py-2 ${i > 0 ? "border-t border-rule" : ""}`}>
                <span className="tnum text-[14px] font-semibold">{y}</span>
                <span className="text-[14px] leading-snug">
                  {firstIn(y)
                    .map((s) => (levels[s.id]?.until != null ? `${s.name} (until ${levels[s.id]!.until})` : s.name))
                    .join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {cv.skills.map((s) => {
          const l = levels[s.id];
          const used = (l?.usedIn ?? []).map((id) => usage[id]);
          const roleCount = used.filter((u) => u.kind === "role").length;
          const projectCount = used.length - roleCount;
          return (
            <div key={s.id} className="sd" data-detail={s.id}>
              <p className="text-[12px] font-medium text-muted">{s.group}</p>
              <p className="mt-0.5 text-[20px] font-semibold leading-tight">{s.name}</p>
              <p className="tnum mt-1 text-[14px]">{formatLevel(l) ?? "On the CV, with no dated role or project"}</p>
              <p id={`sd-used-${s.id}`} className="mt-3 text-[13px] text-muted">
                {used.length === 0
                  ? "Listed on the CV without a role or project."
                  : `Used in ${roleCount} ${roleCount === 1 ? "role" : "roles"} and ${projectCount} ${projectCount === 1 ? "project" : "projects"}.`}
              </p>
              {used.length > 0 ? (
                <ul className="scroll-y mt-2 grid content-start gap-1">
                  {used.map((u) => {
                    const role = cv.roles.find((r) => r.id === u.id);
                    const project = cv.projects.find((p) => p.id === u.id);
                    return (
                      <li key={u.id} data-kind={role ? kindOf(role.id) : undefined}>
                        <Link href={usageHref(s.id, u)} prefetch={false} className="sd-link">
                          {role ? <span className="key size-2.5!" aria-hidden="true" /> : <span className="sd-proj" aria-hidden="true" />}
                          <span className="min-w-0 flex-1 truncate">{u.name}</span>
                          <span className="tnum text-[13px] text-muted">{role ? period(role) : project?.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              <p className="mt-auto border-t border-rule pt-2 text-[13px] text-muted">
                Press its row to mark it on Experience, Projects and the Overview.
              </p>
            </div>
          );
        })}
      </section>
    </SkillPicker>
  );
}
