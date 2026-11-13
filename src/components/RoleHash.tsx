"use client";

import { useEffect } from "react";

/**
 * Opens the role a link names (/experience#role-pentalog): checks its radio, so the CSS that shows
 * the chosen role shows that one. Without JS every role is shown in turn, so nothing is lost.
 */
export function RoleHash() {
  useEffect(() => {
    const pick = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id.startsWith("role-")) return;
      const input = document.getElementById(`pick-${id}`) as HTMLInputElement | null;
      if (input) {
        input.checked = true;
        input.closest("label")?.scrollIntoView({ block: "nearest" });
      }
    };
    pick();
    window.addEventListener("hashchange", pick);
    return () => window.removeEventListener("hashchange", pick);
  }, []);
  return null;
}
