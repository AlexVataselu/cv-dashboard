import { cv } from "@/content/cv";

/** The view each headline figure opens in the Overview's main card (see OverviewModes). */
export const MODES = ["career", "stack", "kinds", "industries"] as const;

/**
 * The CV's four headline figures, as one container split by dividers, and the Overview's tabs:
 * each figure is a radio that switches the main card to the chart behind it (the career, the stack
 * year by year, the kinds of work, the industries). Radios need no JS: arrow keys move between
 * them, a screen reader reads "14 years building software, 1 of 4, selected", and CSS
 * (`.ov:has(:checked)`) shows the chosen view. The real values are in the server HTML; any count-up
 * runs only after the first paint.
 */
export function KpiStrip({ className }: { className?: string }) {
  return (
    <section aria-labelledby="glance" className={className}>
      <h2 id="glance" className="sr-only">
        At a glance
      </h2>
      <fieldset className="kpis">
        <legend className="sr-only">Chart the career by</legend>
        {cv.glance.map((g, i) => (
          <div key={g.label} className="kpi">
            <label className="kpi-btn">
              <input type="radio" name="ov-mode" value={MODES[i]} defaultChecked={i === 0} className="sr-only" />
              {/* As wide as the real value, so the count-up never moves the label beside it. */}
              <span
                className="kpi-value"
                data-count={/^\d+$/.test(g.value) ? g.value : undefined}
                style={{ minWidth: `${g.value.length}ch` }}
              >
                {g.value}
              </span>
              <span className="kpi-label">{g.label}</span>
            </label>
          </div>
        ))}
      </fieldset>
    </section>
  );
}
