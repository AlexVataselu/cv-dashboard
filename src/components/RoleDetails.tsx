"use client";

import type { MouseEvent, ReactNode } from "react";
import type { WorkKind } from "@/content/career";
import { useUiStore } from "@/state/uiStore";

/**
 * The only client part of a role row: the <details> whose open state the store owns (one open at
 * a time) and its highlight for the selected skill. The summary and the body are server-rendered
 * children, so the bullets, the site screenshots and their frames ship no client JS.
 * Without JS the native toggle still works.
 */
export function RoleDetails({
  roleId,
  skillIds,
  kind,
  summaryClassName,
  summary,
  children,
}: {
  roleId: string;
  skillIds: string[];
  kind: WorkKind;
  summaryClassName: string;
  summary: ReactNode;
  children: ReactNode;
}) {
  const open = useUiStore((s) => s.expandedRoleId === roleId);
  const toggleRole = useUiStore((s) => s.toggleRole);
  const highlighted = useUiStore((s) => s.selectedSkill !== null && skillIds.includes(s.selectedSkill));

  const onSummaryClick = (e: MouseEvent) => {
    e.preventDefault();
    toggleRole(roleId);
  };

  return (
    <details
      id={`role-${roleId}`}
      open={open}
      data-highlight={highlighted ? "true" : undefined}
      data-kind={kind}
      className="scroll-mt-6"
    >
      <summary onClick={onSummaryClick} className={summaryClassName}>
        {summary}
      </summary>
      {children}
    </details>
  );
}
