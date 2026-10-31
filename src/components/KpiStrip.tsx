import { cv } from "@/content/cv";

/** The CV's four headline figures, as one container split by dividers: the figure, then what it counts. */
export function KpiStrip() {
  return (
    <section aria-labelledby="glance" className="mt-6">
      <h2 id="glance" className="sr-only">
        At a glance
      </h2>
      <div className="kpis">
        {cv.glance.map((g) => (
          <div key={g.label} className="kpi">
            <p className="kpi-value">{g.value}</p>
            <p className="mt-1 text-[14px] leading-snug text-muted">{g.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
