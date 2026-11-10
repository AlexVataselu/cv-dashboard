import Link from "next/link";
import { cv } from "@/content/cv";
import { AS_OF, IMPACT_ROLE, KIND_LABEL, companyShort, kindOf, period, roleYears } from "@/content/career";
import { CORE_STACK, clientOf, skillName, skillYears } from "@/content/recruiter";

/**
 * The Overview's three plain cards, built for a recruiter's first read: where Alex worked (one line
 * per role), what changed because of the work (the CV's results, large), and the stack a frontend
 * role asks for (with years). No legends, charts or keys to decode.
 */

const yrs = (n: number) => (n <= 1 ? "1 yr" : `${n} yrs`);

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
        <ol className="rc-roles">
          {cv.roles.map((r) => {
            const client = clientOf(r);
            return (
              <li key={r.id} data-kind={kindOf(r.id)}>
                <Link href={`/experience#role-${r.id}`} className="rc-role">
                  <span className="rc-role-when tnum">
                    {period(r)}
                    <span className="text-muted"> · {yrs(roleYears(r, AS_OF))}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="rc-role-title">{r.title}</span>
                    <span className="rc-role-co">
                      <span className="key size-2!" aria-hidden="true" />
                      {companyShort(r)}
                      {client ? <span className="text-muted"> · for {client}</span> : null}
                    </span>
                  </span>
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
        <p className="meta">From the CV, with where they happened</p>
      </div>
      <ul className="rc-results">
        {results.map((i) => {
          const roleId = IMPACT_ROLE[i.source];
          return (
            <li key={i.label} data-kind={roleId ? kindOf(roleId) : undefined}>
              <span className="rc-result-value tnum">{i.value}</span>
              <span className="rc-result-label">{i.label}</span>
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
