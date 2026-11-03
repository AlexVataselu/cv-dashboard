"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { useUiStore } from "@/state/uiStore";

/**
 * Makes the timeline the navigator on Experience: a role's row (a link to #role-id) opens that role
 * in the side card and brings it into view there, and the open role's row is marked (data-open,
 * aria-expanded). A link from elsewhere (/experience#role-pentalog) opens its role on arrival.
 * Without JS the rows are plain in-page links and the role list keeps its native <details> toggles.
 */
export function RoleNav({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const open = (id: string, scroll: boolean) => {
    useUiStore.setState({ expandedRoleId: id });
    if (!scroll) return;
    // After React has opened it.
    requestAnimationFrame(() =>
      document.getElementById(`role-${id}`)?.scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      }),
    );
  };

  useEffect(() => {
    const paint = (id: string | null) => {
      for (const a of ref.current?.querySelectorAll<HTMLElement>("[data-open-role]") ?? []) {
        const on = a.dataset.openRole === id;
        a.setAttribute("aria-expanded", String(on));
        a.dataset.open = String(on);
      }
    };
    paint(useUiStore.getState().expandedRoleId);
    const hash = /^#role-(.+)$/.exec(location.hash)?.[1];
    if (hash && document.getElementById(`role-${hash}`)) open(hash, true);
    return useUiStore.subscribe((s, prev) => {
      if (s.expandedRoleId !== prev.expandedRoleId) paint(s.expandedRoleId);
    });
  }, []);

  const onClick = (e: MouseEvent) => {
    const row = (e.target as Element).closest<HTMLElement>("[data-open-role]");
    if (!row || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    open(row.dataset.openRole!, true);
  };

  return (
    // The rows inside are links; this only listens for their clicks (keyboard included).
    <div ref={ref} onClick={onClick} className={className}>
      {children}
    </div>
  );
}
