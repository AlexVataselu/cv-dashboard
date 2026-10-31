import { cv } from "@/content/cv";

const GROUPS: { name: string; roleIds: string[] }[] = [
  { name: "Product teams", roleIds: ["pentalog", "tryangle"] },
  { name: "Independent", roleIds: ["freelance-2025", "freelance-2021"] },
  { name: "E-commerce", roleIds: ["lhel"] },
];

const years = (n: number) => `${n} ${n === 1 ? "yr" : "yrs"}`;

/**
 * The receipt that adds up to the nine years: every dated role on the CV with its length.
 * Lengths are computed from the CV's own start and end years, so the total is a real sum.
 */
export function YearsReceipt() {
  const now = new Date().getFullYear();
  const role = (id: string) => cv.roles.find((x) => x.id === id)!;
  const length = (id: string) => {
    const r = role(id);
    return (r.end === "now" ? now : r.end) - r.start;
  };
  const name = (id: string) => role(id).company.split(/,| · /)[0].trim();
  const period = (id: string) => {
    const r = role(id);
    return `${r.start}–${r.end === "now" ? "now" : r.end}`;
  };
  const total = GROUPS.flatMap((g) => g.roleIds).reduce((sum, id) => sum + length(id), 0);

  return (
    <div className="rise zigzag w-full self-start bg-paper px-6 pt-6 md:px-8 md:pt-8">
      <p className="display text-lead">Every dated role on the CV</p>
      {GROUPS.map((g) => (
        <div key={g.name} className="mt-6">
          <p className="font-semibold">{g.name}</p>
          <ul className="mt-2 grid gap-2.5">
            {g.roleIds.map((id) => (
              <li key={id} className="flex items-end">
                <span className="min-w-0">
                  {name(id)} <span className="tnum whitespace-nowrap text-slate">{period(id)}</span>
                </span>
                <span aria-hidden="true" className="leader" />
                <span className="tnum shrink-0">{years(length(id))}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="tnum mt-6 flex items-baseline justify-between bg-ink px-4 py-3 font-semibold text-paper">
        <span>Years on the web</span>
        <span>{years(total)}</span>
      </p>
    </div>
  );
}
