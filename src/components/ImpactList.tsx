import { cv } from "@/content/cv";
import { IMPACT_ROLE, kindOf, period } from "@/content/career";

/**
 * The CV's results, each with the place it happened and when, keyed to the timeline's colours.
 * Each result names its role (`data-link`/`data-roles`), so hovering it, or the role's bar on the
 * timeline, lights the pair (LinkedStyles).
 */
export function ImpactList({ className }: { className?: string }) {
  return (
    <section aria-labelledby="impact" className={`card card-col ${className ?? ""}`}>
      <div className="card-head">
        <h2 id="impact" className="card-title">
          Results, with their source
        </h2>
      </div>
      {/* focusable: on a short screen the list scrolls inside its card, and the keyboard can scroll it */}
      <ul className="scroll-y -mx-2 grid content-start" tabIndex={0} aria-label="Results">
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
    </section>
  );
}
