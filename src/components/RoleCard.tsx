import type { Role } from "@/content/types";
import { KIND_LABEL, kindOf, period } from "@/content/career";
import { sitesForRole } from "@/content/sites";
import { BrowserFrame } from "@/components/BrowserFrame";
import { RoleDetails } from "@/components/RoleDetails";
import { SkillBadge } from "@/components/SkillBadge";
import { ChevronDownIcon } from "@/components/icons";

/**
 * One role as a row of the experience table: when, what kind of work, the title and company, the
 * stack. It opens to the CV's bullets (and the live sites it shipped); one row is open at a time.
 * A server component: RoleDetails (open state, highlight) and SkillBadge are the client islands,
 * so the site list and the browser frames stay out of the client bundle.
 */
export function RoleCard({ role, years }: { role: Role; years: number }) {
  const sites = sitesForRole(role.id);
  const kind = kindOf(role.id);

  return (
    <RoleDetails
      roleId={role.id}
      skillIds={role.skillIds}
      kind={kind}
      summaryClassName="role-summary grid gap-x-6 gap-y-1 px-4 py-4 md:grid-cols-[9rem_minmax(0,1fr)_10rem] md:px-5"
      summary={
        <>
          <span className="flex items-center gap-2 md:flex-col md:items-start md:gap-1.5">
            <span className="key md:hidden" aria-hidden="true" />
            <span data-period="" className="tnum text-[14px] font-medium">{period(role)}</span>
            <span className="tnum text-[13px] text-muted">
              <span className="md:hidden">· </span>
              {years} {years === 1 ? "yr" : "yrs"}
            </span>
            <span className="pill kind-pill hidden md:inline-flex">{KIND_LABEL[kind]}</span>
          </span>
          <span className="block min-w-0">
            <span className="block text-[16px] font-semibold leading-snug">{role.title}</span>
            <span className="mt-0.5 block text-[14px]">
              {role.company}
              {role.location ? <span className="text-muted"> · {role.location}</span> : null}
            </span>
            {role.stack.length > 0 ? (
              <span className="mt-1.5 block text-[13px] text-muted">{role.stack.join(" · ")}</span>
            ) : null}
          </span>
          {/* Below md the badge has its own line under the title, always reserved (h-6), so it never
              covers the dates and showing it shifts nothing; from md it is the row's third column. */}
          <span data-badge-slot="" className="flex h-6 min-w-0 items-center gap-2 md:h-7 md:justify-end md:self-start">
            <SkillBadge skillIds={role.skillIds} />
            <ChevronDownIcon className="icon chev ml-auto shrink-0 text-muted md:ml-0" />
          </span>
        </>
      }
    >
      <div className="border-t border-rule px-4 pb-6 pt-4 md:px-5 md:pl-[calc(9rem+1.5rem+1.25rem)]">
        <ul className="grid max-w-[78ch] list-disc gap-2.5 pl-5 text-[15px] marker:text-muted">
          {role.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        {sites.length > 0 ? (
          <div className="mt-5 grid max-w-3xl gap-4 sm:grid-cols-2">
            {sites.map((s) => (
              <a key={s.id} href={s.url} className="group block">
                <BrowserFrame image={s.image} address={s.domain} alt={`Front page of ${s.domain}`} sizes="(min-width: 640px) 360px, 80vw" />
                <span className="mt-2 block text-[14px] font-medium group-hover:underline">{s.name}</span>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </RoleDetails>
  );
}
