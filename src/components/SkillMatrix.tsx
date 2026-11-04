import type { CSSProperties } from "react";
import Link from "next/link";
import { cv } from "@/content/cv";
import { AS_OF, FIRST_YEAR, KINDS, KIND_LABEL, companyShort, kindOf, period } from "@/content/career";
import { IMPLIED_SINCE, deriveAllSkillLevels, formatLevel, usageIndex } from "@/content/skillLevels";
import { GROUPS, GroupFilter, slug, usageHref } from "@/components/SkillGroups";
import { SkillPicker } from "@/components/SkillPicker";

const SPAN = AS_OF - FIRST_YEAR;
const YEARS = Array.from({ length: SPAN + 1 }, (_, i) => FIRST_YEAR + i);
const PROJECTS = "projects";
const yy = (y: number | "now") => (y === "now" ? "now" : `’${String(y).slice(2)}`);

/**
 * The Skills screen as one interactive view, drawn at build time.
 *
 * Left, "Where each skill was used": a matrix of every skill (rows, by group, the longest-used
 * first) against the career (columns: each role in date order, then the personal projects). A
 * square in the role's colour marks a role that used the skill; the projects column counts the
 * personal projects that did. Behind each name, a gold bar as long as the skill's years on the CV
 * (the career's 14 years is the full width; outlined once the CV shows it ended). Hovering a column
 * steps back every skill that role did not use, so a role's stack reads at a glance; hovering or
 * focusing a row opens its card and lights its roles in the header.
 * Right, the active skill's card: its years, what dates it, and every role and project that used it,
 * each a link that keeps the skill selected there. With nothing active it lists the skills by the
 * year they first appear.
 *
 * Each row is a button: pressing it selects the skill (`?skill=` stays the source of truth), which
 * marks it on Experience, Projects and the Overview too. One SkillPicker island does the hover,
 * selection and arrow-key movement for every row (see SkillPicker); the rest is HTML and CSS: one
 * rule per skill and one per column, written from the CV. No proficiency is drawn: a bar is only
 * ever the years named on the CV.
 */
export function SkillMatrix() {
  const levels = deriveAllSkillLevels(cv);
  const usage = usageIndex(cv);
  const roles = [...cv.roles].sort((a, b) => a.start - b.start);
  const cols = [...roles.map((r) => r.id), PROJECTS];
  const projectSkills = [...new Set(cv.projects.flatMap((p) => p.skillIds))];
  const years = (id: string) => levels[id]?.years ?? -1;

  // One rule per skill: its card shows, and its roles light in the header.
  // One rule per column: hovering it steps back the skills that role did not use.
  const css =
    cv.skills
      .map(
        (s) =>
          `.sm[data-active="${s.id}"] [data-detail="${s.id}"]{display:flex}` +
          `.sm[data-active="${s.id}"] .cs-lane[data-skills~="${s.id}"]{opacity:1}`,
      )
      .join("") +
    cols
      .map(
        (c) =>
          `.mx:has(.mx-col[data-col="${c}"]:hover) .sm-row:not([data-cols~="${c}"]){opacity:.3}` +
          `.mx:has(.mx-col[data-col="${c}"]:hover) .mx-cell[data-col="${c}"]{background:var(--raised)}` +
          `.mx:has(.mx-col[data-col="${c}"]:hover) .mx-col[data-col="${c}"]{opacity:1;color:var(--ink)}`,
      )
      .join("");

  const firstIn = (y: number) => cv.skills.filter((s) => levels[s.id]?.since === y);
  const byYear = YEARS.filter((y) => firstIn(y).length > 0).reverse();

  return (
    <SkillPicker className="panel-grid sk sm filtered" data-active="none" roving>
      <style href="skill-matrix" precedence="medium">
        {`${css}.sm[data-active="none"] [data-detail="none"]{display:flex}`}
      </style>

      <section aria-labelledby="sm-title" className="card card-col sm-card span-8">
        <div className="card-head">
          <h2 id="sm-title" className="card-title">
            Where each skill was used
          </h2>
          <p className="meta tnum">
            {cv.skills.length} skills · {roles.length} roles · {cv.projects.length} projects
          </p>
        </div>
        <GroupFilter name="skills-group" />

        <div className="mx mt-3">
          {/* The career as the columns: each role in date order, in its kind's colour, then the projects. */}
          <div className="mx-head" aria-hidden="true">
            <span className="mx-corner">Skill, by years on the CV</span>
            {roles.map((r) => (
              <span key={r.id} className="mx-col cs-lane" data-col={r.id} data-kind={kindOf(r.id)} data-skills={r.skillIds.join(" ")}>
                <span className="cs-name">{companyShort(r).split(" ")[0]}</span>
                <span className="mx-col-years tnum">
                  {yy(r.start)}–{yy(r.end)}
                </span>
              </span>
            ))}
            <span className="mx-col mx-col-proj cs-lane" data-col={PROJECTS} data-skills={projectSkills.join(" ")}>
              <span className="cs-name">Projects</span>
              <span className="mx-col-years tnum">{cv.projects.length} own</span>
            </span>
          </div>

          <div className="scroll-y mx-body" data-flip-root="">
            {GROUPS.map((g) => (
              <section key={g} aria-labelledby={`smg-${slug(g)}`} data-group={slug(g)} data-flip="" className="sm-group">
                <h3 id={`smg-${slug(g)}`} className="sm-group-name">
                  {g}
                </h3>
                <ul>
                  {cv.skills
                    .filter((s) => s.group === g)
                    .map((s, i) => ({ s, i }))
                    // the longest-used first; ties keep the CV's order
                    .sort((a, b) => years(b.s.id) - years(a.s.id) || a.i - b.i)
                    .map(({ s }) => {
                      const l = levels[s.id];
                      const text = formatLevel(l);
                      const past = l?.until != null;
                      const inProjects = cv.projects.filter((p) => p.skillIds.includes(s.id)).length;
                      const used = roles.filter((r) => r.skillIds.includes(s.id)).map((r) => r.id);
                      // HTML, CSS and JavaScript date from the first web role, as the CV's years do:
                      // every role since is marked as implied, not listed.
                      const implied = roles
                        .filter((r) => s.id in IMPLIED_SINCE && r.start >= IMPLIED_SINCE[s.id] && !used.includes(r.id))
                        .map((r) => r.id);
                      const on = [...used, ...implied, ...(inProjects > 0 ? [PROJECTS] : [])];
                      const shown =
                        l?.years != null
                          ? `${l.years} ${l.years === 1 ? "yr" : "yrs"}`
                          : inProjects > 0
                            ? String(AS_OF)
                            : "–";
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            className="sm-row mx-row"
                            aria-pressed="false"
                            data-skill={s.id}
                            data-cols={on.join(" ")}
                            aria-describedby={`sd-used-${s.id}`}
                          >
                            <span className="mx-name">
                              {l?.years != null ? (
                                <span
                                  className={past ? "mx-bar mx-past" : "mx-bar"}
                                  style={{ "--y": Math.min(1, l.years / SPAN) } as CSSProperties}
                                  aria-hidden="true"
                                />
                              ) : null}
                              <span className="sm-name">{s.name}</span>
                              {/* the space as its own text node: an accessible name keeps it, a flex row drops it */}
                              {text ? (
                                <>
                                  {" "}
                                  <span className="sr-only">{`· ${text}`}</span>
                                </>
                              ) : null}
                              <span className="mx-years tnum" aria-hidden="true">
                                {shown}
                              </span>
                            </span>
                            {roles.map((r) => (
                              <span
                                key={r.id}
                                className="mx-cell"
                                data-col={r.id}
                                data-kind={kindOf(r.id)}
                                data-on={used.includes(r.id) || implied.includes(r.id) ? "" : undefined}
                                data-implied={implied.includes(r.id) ? "" : undefined}
                                aria-hidden="true"
                              />
                            ))}
                            <span
                              className="mx-cell mx-proj"
                              data-col={PROJECTS}
                              data-on={inProjects > 0 ? "" : undefined}
                              aria-hidden="true"
                            >
                              {inProjects > 0 ? <span className="tnum">{inProjects}</span> : null}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </section>
            ))}
          </div>
        </div>
        <ul className="sm-key mt-2 border-t border-rule pt-2" aria-label="Key">
          {KINDS.map((k) => (
            <li key={k} data-kind={k}>
              <span className="mx-swatch" aria-hidden="true" />
              {KIND_LABEL[k]}
            </li>
          ))}
          <li data-kind="backend">
            <span className="mx-swatch mx-swatch-implied" aria-hidden="true" />
            Implied by the role
          </li>
          <li>
            <span className="mx-swatch mx-swatch-proj tnum" aria-hidden="true">
              2
            </span>
            Projects that used it
          </li>
          <li>
            <span className="mx-swatch mx-swatch-bar" aria-hidden="true" />
            Years on the CV, of {SPAN} (grey once ended)
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
            Hover or focus a row to see where it was used, or a company to see its stack; press a row to mark the skill
            across Experience, Projects and the Overview.
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
