"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

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
export function ThemeToggle() {
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
    <button
      type="button"
      aria-pressed={dark}
      onClick={toggle}
      className="btn min-h-11 min-w-11 px-3 lg:min-h-10 lg:flex-1"
    >
      <SunIcon className="icon theme-icon-sun" />
      <MoonIcon className="icon theme-icon-moon" />
      {/* The name stays "Dark theme" at every width; below desktop width only the icon shows. */}
      <span className="max-lg:sr-only">Dark theme</span>
    </button>
  );
}
