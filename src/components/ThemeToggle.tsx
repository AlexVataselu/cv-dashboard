"use client";

import { useSyncExternalStore } from "react";

const root = () => document.documentElement;

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const isDark = () => root().dataset.theme === "dark";

/**
 * Switches between the light and the dark sheet and remembers the choice. The inline script in
 * layout.tsx applies the saved or system theme before the first paint; this button only flips it.
 * Its pressed look comes from CSS on data-theme, so nothing changes size or colour at hydration.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const toggle = () => {
    const next = isDark() ? "light" : "dark";
    root().dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be unavailable; the theme still switches for this page view.
    }
  };
  return (
    <button type="button" aria-pressed={dark} onClick={toggle} className={`theme-toggle ${className}`}>
      Dark theme
    </button>
  );
}
