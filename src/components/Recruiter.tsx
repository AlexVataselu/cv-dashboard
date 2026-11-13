import Link from "next/link";
import { cv } from "@/content/cv";
import { AS_OF, IMPACT_ROLE, KIND_LABEL, companyShort, kindOf, period, roleYears } from "@/content/career";
import { AXIS, CORE_STACK, beforeAfter, clientOf, skillName, skillYears, spanOnAxis } from "@/content/recruiter";

/**
 * The Overview's three plain cards, built for a recruiter's first read: where Alex worked (one line
 * per role), what changed because of the work (the CV's results, large), and the stack a frontend
 * role asks for (with years). No legends to decode: each picture says what it shows in words.
 *
 * Motion (CSS only, under prefers-reduced-motion: no-preference): the career bars draw in along
 * the years one after another, the current role's end pulses three times, and each result's
 * "after" bar slides from where it started to where it ended. Every final state is the static
 * markup, so nothing is hidden without the animation.
 */

const yrs = (n: number) => (n <= 1 ? "1 yr" : `${n} yrs`);

/** The career's years as a ruler: its first year, the midpoints, and "now". */
export function Axis({ className }: { className?: string }) {
  const ticks = [AXIS.from, 2017, 2021, AXIS.to - 1];
  const total = AXIS.to - AXIS.from;
  return (
    <span className={`rc-axis ${className ?? ""}`} aria-hidden="true">
      {ticks.map((y, i) => (
        <span key={y} className="tnum" style={{ left: `${((y - AXIS.from) / total) * 100}%` }} data-last={i === ticks.length - 1 || undefined}>
          {i === ticks.length - 1 ? "now" : y}
        </span>
      ))}
    </span>
  );
}

/**
 * Spans of time on the career's axis, drawn as bars on a faint track. `order` staggers the draw-in
 * when several tracks sit in a list; `live` marks a span still running (its end pulses).
 */
export function Track({
  spans,
  order = 0,
  live = false,
  label,
}: {
  spans: { start: number; end: number | "now" }[];
  order?: number;
  live?: boolean;
  label: string;
}) {
  return (
    <span className="rc-track" role="img" aria-label={label} style={{ ["--i" as string]: order }}>
      {spans.map((sp) => {
        const { left, width } = spanOnAxis(sp.start, sp.end);
        return <span key={`${sp.start}`} className="rc-span" style={{ left: `${left}%`, width: `${width}%` }} />;
      })}
      {live ? <span className="rc-now" /> : null}
    </span>
  );
}

/** A result's before and after, as two bars on one scale; null when the figure is words. */
export function BeforeAfter({ value, label }: { value: string; label: string }) {
  const ba = beforeAfter(value);
  if (!ba) return null;
  const max = Math.max(ba.before, ba.after);
  const pct = (n: number) => `${((n / max) * 100).toFixed(1)}%`;
  const unit = ba.unit === "count" ? label.split(" ")[0] : "";
  return (
    <span
      className="rc-ba"
      role="img"
      aria-label={ba.unit === "count" ? `${label}: from ${ba.before} to ${ba.after}` : `${label}: ${value}, from 100 before to ${ba.after} after`}
      style={{ ["--from" as string]: (ba.before / ba.after).toFixed(3) }}
    >
      <span className="rc-ba-row">
        <span className="rc-ba-key">Before</span>
        <span className="rc-ba-bar rc-ba-before" style={{ width: pct(ba.before) }} />
        {ba.unit === "count" ? <span className="rc-ba-n tnum">{ba.before}</span> : null}
      </span>
      <span className="rc-ba-row">
        <span className="rc-ba-key">After</span>
        <span className="rc-ba-bar rc-ba-after" style={{ width: pct(ba.after) }} />
        {ba.unit === "count" ? <span className="rc-ba-n tnum">{ba.after}</span> : null}
      </span>
      {unit ? <span className="sr-only">{unit}</span> : null}
    </span>
  );
}

export function RolesCard({ className }: { className?: string }) {
  return (
    <section aria-labelledby="where" className={`card card-col ${className ?? ""}`}>
      <div className="card-head">
        <h2 id="where" className="card-title">
          Where I&apos;ve worked
        </h2>
        <Link href="/experience" className="card-link">
          All roles
        </Link>
      </div>
      <div className="scroll-y -mx-2" tabIndex={0} role="region" aria-label="Roles, scrollable">
        <div className="rc-roles-axis">
          <Axis />
        </div>
        <ol className="rc-roles">
          {cv.roles.map((r, i) => {
            const client = clientOf(r);
            return (
              <li key={r.id} data-kind={kindOf(r.id)}>
                <Link href={`/experience#role-${r.id}`} className="rc-role">
                  <span className="rc-role-when tnum">
                    {period(r)}
                    <span className="rc-role-yrs text-muted">
                      <span className="sr-only"> · </span>
                      {yrs(roleYears(r, AS_OF))}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="rc-role-title">{r.title}</span>
                    <span className="rc-role-co">
                      <span className="key size-2!" aria-hidden="true" />
                      <span className="rc-nowrap">{companyShort(r)}</span>
                      {client ? <span className="rc-nowrap text-muted">for {client}</span> : null}
                    </span>
                  </span>
                  <Track spans={[r]} order={i} live={r.end === "now"} label={`${period(r)} on the career, ${AXIS.from} to now`} />
                </Link>
              </li>
            );
          })}
        </ol>
        <p className="rc-earlier">Earlier: {cv.earlier}</p>
      </div>
    </section>
  );
}

export function ResultsCard({ className }: { className?: string }) {
  const results = cv.impact.slice(0, 4);
  return (
    <section aria-labelledby="results" className={`card card-col ${className ?? ""}`}>
      <div className="card-head">
        <h2 id="results" className="card-title">
          Results
        </h2>
        <p className="meta">Grey bar before, coloured bar after</p>
      </div>
      <ul className="rc-results">
        {results.map((i) => {
          const roleId = IMPACT_ROLE[i.source];
          return (
            <li key={i.label} data-kind={roleId ? kindOf(roleId) : undefined}>
              <span className="rc-result-value tnum">{i.value}</span>
              <span className="rc-result-label">{i.label}</span>
              <BeforeAfter value={i.value} label={i.label} />
              <span className="rc-result-src">
                <span className="key size-2!" aria-hidden="true" />
                {i.source}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function StackCard({ className }: { className?: string }) {
  return (
    <section aria-labelledby="stack" className={`card card-col ${className ?? ""}`}>
      <div className="card-head">
        <h2 id="stack" className="card-title">
          Core stack
        </h2>
        <Link href="/skills" className="card-link">
          All {cv.skills.length} skills
        </Link>
      </div>
      <div className="scroll-y" tabIndex={0} role="region" aria-label="Core stack, scrollable">
        <dl className="rc-stack">
          {CORE_STACK.map((g) => (
            <div key={g.group}>
              <dt>{g.group}</dt>
              <dd>
                <ul>
                  {g.ids.map((id) => {
                    const y = skillYears(id);
                    return (
                      <li key={id} className="rc-chip">
                        {skillName(id).replace(/ \(.*\)$/, "")}
                        {y ? <span className="tnum">{y}</span> : null}
                      </li>
                    );
                  })}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** The kind of work a role was, as a soft pill (the same hue as the role everywhere). */
export function KindPill({ roleId }: { roleId: string }) {
  const k = kindOf(roleId);
  return (
    <span className="pill kind-pill" data-kind={k}>
      {KIND_LABEL[k]}
    </span>
  );
}
