import type { CSSProperties, ReactNode } from "react";
import { cv } from "@/content/cv";
import { KIND_LABEL, companyShort, kindOf, overlapSpan, period, roleYears } from "@/content/career";
import { sites } from "@/content/sites";
import { ChevronDownIcon } from "@/components/icons";

const yrs = (n: number) => `${n} ${n === 1 ? "yr" : "yrs"}`;
const roleById = (id: string) => cv.roles.find((r) => r.id === id)!;
const siteNames = (ids: string[]) => ids.map((id) => sites.find((s) => s.id === id)!.name).join(", ");

/** The skills behind the second figure ("5 years on React, Next.js, TypeScript and React Native"). */
const STACK = ["react", "nextjs", "typescript", "react-native"];
const stackNames = (ids: string[]) =>
  STACK.filter((id) => ids.includes(id))
    .map((id) => cv.skills.find((s) => s.id === id)!.name.replace(/ \(.*\)$/, ""))
    .join(", ");

/** One line of a breakdown: a key in the kind's hue, a name, and its figure on the right. */
function Line({ kind, name, figure, note }: { kind?: string; name: ReactNode; figure: string; note?: string }) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-1.5" data-kind={kind}>
      <span className="flex min-w-0 items-baseline gap-2">
        {kind ? <span className="key size-2.5! shrink-0 self-center" aria-hidden="true" /> : null}
        <span className="min-w-0">
          <span className="block text-[14px]">{name}</span>
          {note ? <span className="block text-[13px] text-muted">{note}</span> : null}
        </span>
      </span>
      <span className="tnum text-[13px] text-muted">{figure}</span>
    </li>
  );
}

/**
 * What each headline figure is made of, from the same role data the timeline draws. Nothing here is
 * new: every line is a role, a project, a period or a site already on the CV.
 */
function breakdowns(): { title: string; body: ReactNode }[] {
  const oldestFirst = [...cv.roles].sort((a, b) => a.start - b.start);
  const shared = overlapSpan();
  const since2021 = [...cv.roles, ...cv.projects]
    .filter((r) => r.start >= 2021 && STACK.some((id) => r.skillIds.includes(id)))
    .sort((a, b) => a.start - b.start);
  const product = cv.roles.filter((r) => kindOf(r.id) === "product");
  const indie = cv.roles.filter((r) => kindOf(r.id) === "indie");
  const freelance2021 = period(roleById("freelance-2021"));
  return [
    {
      title: "Every dated role, 2012 to now",
      body: (
        <>
          <ul className="divide-y divide-(--rule)">
            {oldestFirst.map((r) => (
              <Line
                key={r.id}
                kind={kindOf(r.id)}
                name={companyShort(r)}
                note={r.title}
                figure={`${period(r)} · ${yrs(roleYears(r, cv.asOf))}`}
              />
            ))}
          </ul>
          {shared ? (
            <p className="mt-2 text-[13px] text-muted">
              Two roles ran side by side in {shared.start}–{shared.end}, so those years count once. Earlier, undated:{" "}
              {cv.earlier}.
            </p>
          ) : null}
        </>
      ),
    },
    {
      title: "Where React, Next.js, TypeScript and React Native were used",
      body: (
        <ul className="divide-y divide-(--rule)">
          {since2021.map((r) =>
            "company" in r ? (
              <Line key={r.id} kind={kindOf(r.id)} name={companyShort(r)} note={stackNames(r.skillIds)} figure={period(r)} />
            ) : (
              <Line key={r.id} name={r.title.split(", ")[0]} note={stackNames(r.skillIds)} figure={r.label} />
            ),
          )}
        </ul>
      ),
    },
    {
      title: "Product teams, then independent work",
      body: (
        <>
          <p className="text-[13px] font-medium text-muted">{KIND_LABEL.product}s</p>
          <ul className="divide-y divide-(--rule)">
            {product.map((r) => (
              <Line key={r.id} kind="product" name={r.company} note={r.title} figure={period(r)} />
            ))}
          </ul>
          <p className="mt-3 text-[13px] font-medium text-muted">{KIND_LABEL.indie}</p>
          <ul className="divide-y divide-(--rule)">
            {indie.map((r) => (
              <Line key={r.id} kind="indie" name={companyShort(r)} note={r.title} figure={period(r)} />
            ))}
          </ul>
        </>
      ),
    },
    {
      title: "The three industries",
      body: (
        <ul className="divide-y divide-(--rule)">
          <Line kind="indie" name="Healthcare" note={siteNames(["recuperareacasa", "eyeexcellence", "orlrasnov"])} figure={freelance2021} />
          <Line kind="indie" name="Fintech" note="Named on the CV for the freelance work" figure={freelance2021} />
          <Line kind="indie" name="Cultural heritage" note={siteNames(["azuga365", "litoralinlucru"])} figure={period(roleById("freelance-2025"))} />
        </ul>
      ),
    },
  ];
}

/**
 * The CV's four headline figures, as one container split by dividers. Each figure is a button that
 * opens its breakdown in a native popover (no JS: the browser opens it, and Esc or a click outside
 * closes it). The real values are in the server HTML; any count-up runs only after the first paint.
 */
export function KpiStrip({ className }: { className?: string }) {
  const parts = breakdowns();
  return (
    <section aria-labelledby="glance" className={className}>
      <h2 id="glance" className="sr-only">
        At a glance
      </h2>
      <ul className="kpis">
        {cv.glance.map((g, i) => (
          <li key={g.label} className="kpi">
            <button
              type="button"
              popoverTarget={`kpi-${i}`}
              className="kpi-btn"
              style={{ anchorName: `--kpi-${i}` } as CSSProperties}
            >
              {/* As wide as the real value, so the count-up never moves the label beside it. */}
              <span
                className="kpi-value"
                data-count={/^\d+$/.test(g.value) ? g.value : undefined}
                style={{ minWidth: `${g.value.length}ch` }}
              >
                {g.value}
              </span>
              <span className="kpi-label">{g.label}</span>
              <ChevronDownIcon className="icon kpi-more" aria-hidden="true" />
            </button>
            <div
              id={`kpi-${i}`}
              popover="auto"
              role="group"
              aria-label={parts[i].title}
              className="kpi-pop"
              style={{ positionAnchor: `--kpi-${i}` } as CSSProperties}
            >
              <p className="mb-1 text-[14px] font-semibold">{parts[i].title}</p>
              {parts[i].body}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
