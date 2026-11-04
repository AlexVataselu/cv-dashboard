import { cv } from "@/content/cv";
import { AS_OF, FIRST_YEAR, companyShort, kindOf } from "@/content/career";
import { deriveSkillLevel } from "@/content/skillLevels";
import { sites } from "@/content/sites";

/**
 * The CV's four headline figures, as one container split by dividers, each with the line of CV
 * data behind it under its label (the span, the stack's first year, the product teams, the live
 * sites). The real values are in the server HTML; any count-up runs only after the first paint.
 */
export function KpiStrip({ className }: { className?: string }) {
  const reactSince = deriveSkillLevel("react", cv).since ?? AS_OF;
  const teams = cv.roles
    .filter((r) => kindOf(r.id) === "product")
    .sort((a, b) => a.start - b.start)
    .map(companyShort)
    .join(", ");
  const details = [`${FIRST_YEAR} to ${AS_OF}`, `since ${reactSince}`, teams, `${sites.length} live client sites`];
  return (
    <section aria-labelledby="glance" className={className}>
      <h2 id="glance" className="sr-only">
        At a glance
      </h2>
      <ul className="kpis">
        {cv.glance.map((g, i) => (
          <li key={g.label} className="kpi">
            <div className="kpi-fig">
              {/* As wide as the real value, so the count-up never moves the label beside it. */}
              <span
                className="kpi-value"
                data-count={/^\d+$/.test(g.value) ? g.value : undefined}
                style={{ minWidth: `${g.value.length}ch` }}
              >
                {g.value}
              </span>
              <span className="min-w-0">
                <span className="kpi-label">{g.label}</span>
                <span className="kpi-detail tnum">{details[i]}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
