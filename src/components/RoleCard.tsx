"use client";

import type { MouseEvent } from "react";
import type { Role } from "@/content/types";
import { useUiStore } from "@/state/uiStore";

const period = (r: Role) => `${r.start} – ${r.end === "now" ? "now" : r.end}`;

export function RoleCard({ role }: { role: Role }) {
  const open = useUiStore((s) => s.expandedRoleId === role.id);
  const toggleRole = useUiStore((s) => s.toggleRole);
  const highlighted = useUiStore(
    (s) => s.selectedSkill !== null && role.skillIds.includes(s.selectedSkill),
  );

  // With JS, the store owns open/closed; without JS the native toggle still works.
  const onSummaryClick = (e: MouseEvent) => {
    e.preventDefault();
    toggleRole(role.id);
  };

  return (
    <details
      open={open}
      data-highlight={highlighted ? "true" : undefined}
      className="rounded-md border border-border bg-bg data-[highlight=true]:border-accent data-[highlight=true]:bg-accent/10"
    >
      <summary
        onClick={onSummaryClick}
        className="cursor-pointer list-none p-3 [&::-webkit-details-marker]:hidden"
      >
        <span className="block font-mono text-xs text-muted">{period(role)}</span>
        <span className="block text-base font-semibold text-heading">{role.title}</span>
        <span className="block text-sm text-text">
          {role.company}
          {role.location ? <span className="text-muted"> · {role.location}</span> : null}
        </span>
        {role.stack.length > 0 ? (
          <span className="mt-2 flex flex-wrap gap-1.5">
            {role.stack.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-muted"
              >
                {t}
              </span>
            ))}
          </span>
        ) : null}
      </summary>
      <ul className="list-disc space-y-2 border-t border-border py-3 pl-8 pr-3 text-sm text-text">
        {role.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </details>
  );
}
