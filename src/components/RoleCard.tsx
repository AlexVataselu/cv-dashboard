import type { Role } from "@/content/types";
import { KIND_LABEL, kindOf, period } from "@/content/career";
import { sitesForRole } from "@/content/sites";
import { BrowserFrame } from "@/components/BrowserFrame";
import { RoleDetails } from "@/components/RoleDetails";
import { SkillBadge } from "@/components/SkillBadge";
import { ChevronDownIcon } from "@/components/icons";

/**
 * One role as a row of the role list: when, what kind of work, the title and company, the stack.
 * It opens to the CV's bullets (and the live sites it shipped); one row is open at a time.
 * Its layout follows the list's own width (container queries), not the window's: a narrow side
 * card beside the timeline stacks the row; a wide list (tablet) lays it out in three columns.
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
      summaryClassName="role-summary grid gap-x-6 gap-y-1 px-4 py-3 @xl:grid-cols-[9rem_minmax(0,1fr)_10rem] @xl:px-5 @xl:py-4"
      summary={
        <>
          <span className="flex items-center gap-2 @xl:flex-col @xl:items-start @xl:gap-1.5">
            <span className="key @xl:hidden" aria-hidden="true" />
            <span data-period="" className="tnum text-[14px] font-medium">{period(role)}</span>
            <span className="tnum text-[13px] text-muted">
              <span className="@xl:hidden">· </span>
              {years} {years === 1 ? "yr" : "yrs"}
            </span>
            <span className="pill kind-pill hidden @xl:inline-flex">{KIND_LABEL[kind]}</span>
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
          {/* In a narrow list the badge has its own line under the title, always reserved (h-6), so it
              never covers the dates and showing it shifts nothing; in a wide list it is the third column. */}
          <span data-badge-slot="" className="flex h-6 min-w-0 items-center gap-2 @xl:h-7 @xl:justify-end @xl:self-start">
            <SkillBadge skillIds={role.skillIds} />
            <ChevronDownIcon className="icon chev ml-auto shrink-0 text-muted @xl:ml-0" />
          </span>
        </>
      }
    >
      <div className="role-body border-t border-rule px-4 pb-5 pt-3 @xl:px-5 @xl:pl-[calc(9rem+1.5rem+1.25rem)]">
        <ul className="grid max-w-[78ch] list-disc gap-2 pl-5 text-[15px] marker:text-muted">
          {role.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        {sites.length > 0 ? (
          <div className="mt-4 grid max-w-3xl gap-4 @md:grid-cols-2">
            {sites.map((s) => (
              <a key={s.id} href={s.url} className="group block">
                <BrowserFrame image={s.image} address={s.domain} alt={`Front page of ${s.domain}`} sizes="(min-width: 1024px) 400px, (min-width: 640px) 360px, 80vw" />
                <span className="mt-2 block text-[14px] font-medium group-hover:underline">{s.name}</span>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </RoleDetails>
  );
}
