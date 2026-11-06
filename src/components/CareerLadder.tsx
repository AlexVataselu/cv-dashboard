import type { CSSProperties } from "react";
import Link from "next/link";
import { cv } from "@/content/cv";
import { AS_OF, FIRST_YEAR, KINDS, KIND_LABEL, careerTotals, companyShort, kindOf, overlapSpan, period, roleEnd, roleYears, yearsHeld } from "@/content/career";
import { IMPLIED_SINCE, deriveAllSkillLevels, usageIndex } from "@/content/skillLevels";
import type { Role } from "@/content/types";
import { SkillPicker } from "@/components/SkillPicker";
import { PlayIcon, StopIcon } from "@/components/icons";

const yrs = (n: number) => `${n} ${n === 1 ? "yr" : "yrs"}`;
const SPAN = AS_OF - FIRST_YEAR;
/** a year's place on the rail, from the top (the CV's year) to the bottom (the first role) */
const y = (year: number) => ((AS_OF - year) / SPAN) * 100;

type Chip = { id: string; how: "listed" | "estimated" | "implied" };

/** A role's skills: the ones its CV entry names, then the estimated ones; for a role that names
    none, the ones its kind of work implies (HTML, CSS and JavaScript for the first web role). */
function chipsOf(r: Role): Chip[] {
  const listed = r.skillIds.map((id) => ({ id, how: "listed" as const }));
  const estimated = (r.estimatedSkillIds ?? []).map((id) => ({ id, how: "estimated" as const }));
  const implied =
    r.skillIds.length === 0
      ? Object.entries(IMPLIED_SINCE)
          .filter(([, since]) => r.start >= since)
          .map(([id]) => ({ id, how: "implied" as const }))
      : [];
  return [...listed, ...implied, ...estimated];
}

/** Lanes on the rail: a role takes the first lane free at its start, so roles held at once sit side by side. */
function lanes<T extends { id: string; start: number; end: number }>(items: T[]) {
  const ends: number[] = [];
  const lane: Record<string, number> = {};
  for (const it of [...items].sort((a, b) => a.start - b.start)) {
    let i = ends.findIndex((e) => e <= it.start);
    if (i === -1) i = ends.length;
    ends[i] = it.end;
    lane[it.id] = i;
  }
  return lane;
}

/**
 * The career as a ladder, newest at the top. On the left, a rail of the years with each role as a
 * span as long as it lasted, in its kind of work's colour (roles held at once side by side); a
 * line runs from each span to its chapter on the right: the company, the title, the years, and the
 * skills the role used as chips (solid: named on the CV; dashed: estimated or implied). Pressing a
 * chip selects the skill (`?skill=`): every chapter and span that used it stays lit and the rest
 * step back, here and on every screen. Hovering a chapter lights its span and line, and (in a
 * `.linked` area) its results and skills elsewhere.
 * - `overview`: each chapter links to its role on Experience; three chips, then a count.
 * - `experience`: each chapter opens its role in the side card (RoleNav); every chip.
 */
export function CareerLadder({ variant, className }: { variant: "overview" | "experience"; className?: string }) {
  const levels = deriveAllSkillLevels(cv);
  const usage = usageIndex(cv);
  const skill = (id: string) => cv.skills.find((s) => s.id === id)!;
  const { years: total } = careerTotals();
  const shared = overlapSpan();
  const roles = [...cv.roles].sort((a, b) => roleEnd(b, AS_OF) - roleEnd(a, AS_OF) || b.start - a.start);
  const projects = [...cv.projects].sort((a, b) => a.start - b.start);
  const projStart = projects[0]?.start ?? AS_OF;

  const skillsOfCount = (id: string) => {
    const r = cv.roles.find((x) => x.id === id);
    return r ? chipsOf(r).length : cv.projects.length;
  };

  // the chapters, newest first; the personal projects run alongside the roles since their first year
  const chapters = [
    ...roles.map((r) => ({ id: r.id, start: r.start, end: roleEnd(r, AS_OF), now: r.end === "now", kind: kindOf(r.id) as string })),
    { id: "projects", start: projStart, end: AS_OF, now: true, kind: "projects" },
  ].sort((a, b) => b.end - a.end || b.start - a.start);
  // the years each chapter was held in: a year in focus (hovered on the rail, the chart or the kinds
  // strip, or played) lights the chapters that hold it (src/motion/interact.ts)
  const held = (c: (typeof chapters)[number]) => yearsHeld(c.start, c.end, c.now).join(" ");
  const lane = lanes(chapters);
  const max = variant === "overview" ? 3 : Infinity;
  // Each chapter's share of the height: on Experience a role with many skills (two rows of chips)
  // gets more; the lines end at each chapter's middle by the same shares.
  const weight = (id: string) => (variant === "experience" && skillsOfCount(id) > 7 ? 1.6 : 1);
  const weights = chapters.map((c) => weight(c.id));
  const totalW = weights.reduce((a, w) => a + w, 0);
  const mid = (i: number) => (weights.slice(0, i).reduce((a, w) => a + w, 0) + weights[i] / 2) / totalW;
  const ticks = Array.from({ length: SPAN + 1 }, (_, i) => FIRST_YEAR + i).filter((t) => t % 2 === 0 || t === AS_OF);

  // Hovering or focusing a chapter lights its span and its line (one rule per chapter).
  const css = chapters
    .map(
      (c) =>
        `.cl:has(.cl-ch[data-ch="${c.id}"]:is(:hover,:focus-within)) :is(.cl-span,.cl-line)[data-ch="${c.id}"]{opacity:1;filter:none}` +
        `.cl:has(.cl-ch[data-ch="${c.id}"]:is(:hover,:focus-within)) .cl-line[data-ch="${c.id}"]{stroke-width:2.5}`,
    )
    .join("");

  const skillsOf = (id: string) => {
    const r = cv.roles.find((x) => x.id === id);
    return r ? chipsOf(r) : [...new Set(projects.flatMap((p) => p.skillIds))].map((s) => ({ id: s, how: "listed" as const }));
  };

  return (
    <figure className={`card card-col ${className ?? ""}`} aria-labelledby={`cl-title-${variant}`}>
      <style href="career-ladder" precedence="medium">
        {css}
      </style>
      <div className="card-head mb-1!">
        <div className="flex min-w-0 items-center gap-2">
          <h2 id={`cl-title-${variant}`} className="card-title">
            Career, {FIRST_YEAR} to now
          </h2>
          {/* Plays the career a year at a time: the chapters, the chart, the kinds strip and the
              figures follow the year. Needs JS, so it shows only with it. */}
          {variant === "overview" ? (
            <button type="button" className="cl-play" aria-pressed="false" data-from={FIRST_YEAR} data-to={AS_OF}>
              <PlayIcon className="icon cl-play-on size-3.5" />
              <StopIcon className="icon cl-play-off size-3.5" />
              <span className="cl-play-label">Play</span>
              <span className="sr-only"> the career, {FIRST_YEAR} to {AS_OF}</span>
            </button>
          ) : null}
        </div>
        <p className="meta tnum">
          {yrs(total)} in dated roles{shared ? `, ${shared.start}–${shared.end} two at once` : ""}
        </p>
      </div>
      <ul className="cl-key" aria-label="Key">
        {KINDS.map((k) => (
          <li key={k} data-kind={k}>
            <span className="key size-2.5!" aria-hidden="true" />
            {KIND_LABEL[k]}
          </li>
        ))}
        <li className="cl-key-est-item">
          <span className="cl-key-est" aria-hidden="true" />
          Estimated skill
        </li>
      </ul>

      <SkillPicker className={`cl cl-${variant}`} roving rovingSelector=".cl-chip">
        {/* the years, with each role as a span as long as it lasted */}
        <div className="cl-rail" aria-hidden="true" data-from={FIRST_YEAR} data-to={AS_OF}>
          <span className="cl-at" />
          {ticks.map((t) => (
            <span key={t} className="cl-tick tnum" style={{ top: `${y(t)}%` }}>
              {t}
            </span>
          ))}
          {chapters.map((c, i) => (
            <span
              key={c.id}
              className="cl-span"
              data-ch={c.id}
              data-years={held(c)}
              data-kind={c.kind === "projects" ? undefined : c.kind}
              data-proj={c.kind === "projects" ? "" : undefined}
              data-skills={skillsOf(c.id).map((s) => s.id).join(" ")}
              style={
                {
                  top: `${y(c.end)}%`,
                  bottom: `${100 - y(c.start)}%`,
                  "--lane": lane[c.id],
                  "--i": i,
                } as CSSProperties
              }
            />
          ))}
        </div>
        {/* a line from each span's middle to its chapter's */}
        <svg className="cl-lines" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true">
          {chapters.map((c, i) => {
            const a = ((y(c.end) + y(c.start)) / 2) * 10;
            const b = mid(i) * 1000;
            return (
              <path
                key={c.id}
                className="cl-line"
                data-ch={c.id}
                data-years={held(c)}
                data-kind={c.kind === "projects" ? undefined : c.kind}
                data-skills={skillsOf(c.id).map((s) => s.id).join(" ")}
                d={`M0 ${a} C 55 ${a}, 45 ${b}, 100 ${b}`}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {/* a selected skill's thread through the chapters that used it (drawn by src/motion/interact.ts) */}
        <svg className="cl-thread" aria-hidden="true" />
        <ol className="cl-chapters" style={{ gridTemplateRows: weights.map((w) => `minmax(0, ${w}fr)`).join(" ") }}>
          {chapters.map((c, n) => {
            const r = cv.roles.find((x) => x.id === c.id);
            const chips = skillsOf(c.id);
            const shown = chips.slice(0, max);
            const more = chips.length - shown.length;
            const all = chips.map((s) => s.id).join(" ");
            const linkProps = {
              className: "tl-row cl-link",
              "data-kind": r ? kindOf(r.id) : undefined,
              "data-link": r?.id,
              "data-roles": r?.id,
              "data-skills": all,
              "data-item": r ? "role" : undefined,
            };
            return (
              <li
                key={c.id}
                className="cl-ch"
                data-ch={c.id}
                data-kind={r ? kindOf(r.id) : undefined}
                data-years={held(c)}
                style={{ "--n": n } as CSSProperties}
              >
                {r ? (
                  variant === "overview" ? (
                    <Link href={`/experience#role-${r.id}`} prefetch={false} {...linkProps}>
                      <Head r={r} />
                    </Link>
                  ) : (
                    <a href={`#role-${r.id}`} aria-controls={`role-${r.id}`} data-open-role={r.id} {...linkProps}>
                      <Head r={r} />
                    </a>
                  )
                ) : (
                  <Link href="/projects" prefetch={false} className="cl-link" data-skills={all}>
                    <span className="cl-co">Personal projects</span>
                    <span className="cl-yrs tnum">
                      {projects.length} since {projStart}
                    </span>
                  </Link>
                )}
                <ul className="cl-skills">
                  {!r
                    ? projects.map((p) => (
                        <li key={p.id}>
                          <span
                            className="tl-proj"
                            data-name={p.title.split(", ")[0]}
                            data-skills={p.skillIds.join(" ")}
                            data-item="project"
                          >
                            {variant === "overview" ? p.title.split(", ")[0].replace(/ Skip Intro & Recap$/, "") : p.title.split(", ")[0]}
                          </span>
                        </li>
                      ))
                    : shown.map((s) => {
                        const l = levels[s.id];
                        const where = [
                          ...(l?.usedIn ?? []).map((u) => usage[u].name),
                          ...(l?.estimatedIn ?? []).map((u) => `${usage[u].name} (estimated)`),
                        ].join(", ");
                        return (
                          <li key={s.id}>
                            <button
                              type="button"
                              aria-pressed="false"
                              className="skill-chip cl-chip"
                              data-skill={s.id}
                              data-how={s.how === "listed" ? undefined : s.how}
                              data-roles={[...(l?.usedIn ?? []), ...(l?.estimatedIn ?? [])].join(" ") || undefined}
                              data-used={where || undefined}
                            >
                              <span className="skill-name">{skill(s.id).name.replace(/ \(.*\)$/, "")}</span>
                              {s.how === "listed" ? null : <span className="sr-only"> ({s.how})</span>}
                            </button>
                          </li>
                        );
                      })}
                  {r && more > 0 ? (
                    <li className="cl-more tnum" aria-label={`and ${more} more skills`}>
                      +{more}
                    </li>
                  ) : null}
                </ul>
              </li>
            );
          })}
        </ol>
      </SkillPicker>
    </figure>
  );
}

function Head({ r }: { r: Role }) {
  return (
    <>
      <span className="cl-co">{companyShort(r)}</span>
      <span className="cl-title">{r.title}</span>
      <span className="cl-yrs tnum">
        {period(r)} · {yrs(roleYears(r, AS_OF))}
      </span>
    </>
  );
}
