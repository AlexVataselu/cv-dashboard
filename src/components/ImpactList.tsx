import { cv } from "@/content/cv";
import { IMPACT_ROLE, kindOf, period } from "@/content/career";
import { measured } from "@/content/measured";

/**
 * The results, with their source, in two groups kept apart:
 * - on the CV: the CV's own results, each with the role it happened in and when;
 * - measured: results measured on the work itself (scores, test counts, detection runs), each
 *   saying how and when it was measured (see content/measured.ts).
 * Each result in a role names it (`data-link`/`data-roles`), so hovering it, or the role on the
 * career ladder, lights the pair (LinkedStyles), keyed to the role's colour.
 */
export function ImpactList({ className }: { className?: string }) {
  return (
    <section aria-labelledby="impact" className={`card card-col ${className ?? ""}`}>
      <div className="card-head">
        <h2 id="impact" className="card-title">
          Results, with their source
        </h2>
        <p className="meta tnum">
          {cv.impact.length} on the CV · {measured.length} measured
        </p>
      </div>
      {/* focusable: the list scrolls inside its card, and the keyboard can scroll it */}
      <div className="scroll-y -mx-2" tabIndex={0} role="region" aria-label="Results">
        <h3 className="result-group">On the CV</h3>
        <ul className="grid content-start">
          {cv.impact.map((i) => {
            const roleId = IMPACT_ROLE[i.source];
            const role = cv.roles.find((r) => r.id === roleId);
            return (
              <li key={i.label} className="result" data-link={roleId} data-roles={roleId}>
                <p className="tnum text-[18px] font-semibold leading-tight">{i.value}</p>
                <div className="min-w-0">
                  <p className="text-[14px] leading-snug">{i.label}</p>
                  <p
                    className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted"
                    data-kind={roleId ? kindOf(roleId) : undefined}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span className="key size-2.5!" aria-hidden="true" />
                      {i.source}
                    </span>
                    {role ? <span className="tnum whitespace-nowrap">· {period(role)}</span> : null}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <h3 className="result-group">Measured on the work</h3>
        <ul className="grid content-start">
          {measured.map((m) => (
            <li
              key={m.label}
              className="result"
              data-link={m.roleId}
              data-roles={m.roleId}
            >
              <p className="tnum text-[18px] font-semibold leading-tight">{m.value}</p>
              <div className="min-w-0">
                <p className="text-[14px] leading-snug">{m.label}</p>
                <p
                  className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted"
                  data-kind={m.roleId ? kindOf(m.roleId) : undefined}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {m.roleId ? (
                      <span className="key size-2.5!" aria-hidden="true" />
                    ) : (
                      <span className="result-proj" aria-hidden="true" />
                    )}
                    {m.source}
                  </span>
                </p>
                <p className="result-how">{m.how}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
