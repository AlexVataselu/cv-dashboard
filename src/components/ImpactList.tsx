import { cv } from "@/content/cv";
import { IMPACT_ROLE, kindOf, period } from "@/content/career";

/** The CV's results, each with the place it happened and when, keyed to the timeline's colours. */
export function ImpactList() {
  return (
    <section aria-labelledby="impact" className="card">
      <div className="card-head">
        <h2 id="impact" className="card-title">
          Results, with their source
        </h2>
      </div>
      <ul className="grid">
        {cv.impact.map((i, n) => {
          const roleId = IMPACT_ROLE[i.source];
          const role = cv.roles.find((r) => r.id === roleId);
          return (
            <li
              key={i.label}
              className={`grid gap-x-4 gap-y-1 sm:grid-cols-[6.75rem_minmax(0,1fr)] py-3 ${n > 0 ? "border-t border-rule" : "pt-0"}`}
            >
              <p className="tnum text-[18px] font-semibold leading-tight">{i.value}</p>
              <div className="min-w-0">
                <p className="text-[14px] leading-snug">{i.label}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted" data-kind={roleId ? kindOf(roleId) : undefined}>
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
