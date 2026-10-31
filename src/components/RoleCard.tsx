"use client";

import type { MouseEvent } from "react";
import type { Role } from "@/content/types";
import { sitesForRole } from "@/content/sites";
import { SitePlate } from "@/components/SitePlate";
import { SkillBadge } from "@/components/SkillBadge";
import { useUiStore } from "@/state/uiStore";

const period = (r: Role) => `${r.start} – ${r.end === "now" ? "now" : r.end}`;

/**
 * One role, set the way the printed CV sets it: the start year large in the graphite year column,
 * held in place while the role beside it scrolls; the role itself opens like a folded sheet.
 */
export function RoleCard({ role }: { role: Role }) {
  const open = useUiStore((s) => s.expandedRoleId === role.id);
  const toggleRole = useUiStore((s) => s.toggleRole);
  const highlighted = useUiStore(
    (s) => s.selectedSkill !== null && role.skillIds.includes(s.selectedSkill),
  );
  const sites = sitesForRole(role.id);

  // With JS, the store owns open/closed; without JS the native toggle still works.
  const onSummaryClick = (e: MouseEvent) => {
    e.preventDefault();
    toggleRole(role.id);
  };

  return (
    <div className="grid gap-3 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8 lg:grid-cols-[11rem_minmax(0,1fr)]">
      <div className="md:sticky md:top-8 md:self-start">
        <p aria-hidden="true" className="display tnum text-head text-graphite md:text-poster">
          {role.start}
        </p>
      </div>
      <details
        id={`role-${role.id}`}
        open={open}
        data-highlight={highlighted ? "true" : undefined}
        className="group/role rise scroll-mt-6 bg-band transition-colors duration-200 data-[highlight=true]:bg-band-2"
      >
        <summary
          onClick={onSummaryClick}
          className="block cursor-pointer list-none p-5 hover:bg-band-2 md:p-7 [&::-webkit-details-marker]:hidden"
        >
          <span className="flex min-h-6 items-center justify-between gap-3">
            <span className="tnum shrink-0 text-slate">{period(role)}</span>
            <SkillBadge skillIds={role.skillIds} />
          </span>
          <span className="mt-2 flex items-start justify-between gap-4">
            <span className="display block text-lead leading-tight">{role.title}</span>
            <span
              aria-hidden="true"
              className="display shrink-0 text-head leading-none transition-transform duration-200 group-open/role:rotate-45"
            >
              +
            </span>
          </span>
          <span className="mt-1 block font-semibold">
            {role.company}
            {role.location ? <span className="font-normal text-slate"> · {role.location}</span> : null}
          </span>
          {role.stack.length > 0 ? (
            <span className="mt-3 block text-small text-slate">{role.stack.join(" · ")}</span>
          ) : null}
        </summary>
        <div className="bg-paper px-5 pb-6 pt-5 md:px-7 md:pb-8">
          <ul className="grid list-disc gap-3 pl-5 marker:text-slate">
            {role.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          {sites.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {sites.map((s) => (
                <SitePlate key={s.id} site={s} caption="name" sizes="(min-width: 1024px) 26vw, (min-width: 640px) 45vw, 90vw" />
              ))}
            </div>
          ) : null}
        </div>
      </details>
    </div>
  );
}
