"use client";

const root = () => document.documentElement;

function setTheme(next: "light" | "dark") {
  root().dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Storage can be unavailable; the theme still switches for this page view.
  }
}

/**
 * The dashboard's backlight. Turning it on (the light theme) lights the screen from behind: the
 * light page spreads out from the middle of the dashboard panel with a soft edge and a brief LCD
 * flicker; turning it off (the dark theme, the default) draws the light back into the middle.
 * The sweep is a View Transition of the whole page, shaped by CSS (html[data-backlight]); without
 * the API, or with reduced motion, the theme just switches. Labels and the lit screen in the icon
 * come from CSS on data-theme, so the first paint is already right and nothing changes at hydration.
 */
export function ThemeToggle() {
  const toggle = () => {
    const next = root().dataset.theme === "light" ? "dark" : "light";
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || typeof document.startViewTransition !== "function") {
      setTheme(next);
      return;
    }
    // The light comes from behind the middle of the dashboard panel (the "screen").
    const sheet = document.querySelector(".sheet")?.getBoundingClientRect();
    const x = sheet ? sheet.left + sheet.width / 2 : innerWidth / 2;
    const y = sheet ? sheet.top + Math.min(sheet.height, innerHeight) / 2 : innerHeight / 2;
    root().style.setProperty("--bl-x", `${Math.round(x)}px`);
    root().style.setProperty("--bl-y", `${Math.round(y)}px`);
    root().dataset.backlight = next === "light" ? "on" : "off";
    const transition = document.startViewTransition(() => setTheme(next));
    transition.finished.finally(() => delete root().dataset.backlight);
  };

  return (
    <button type="button" onClick={toggle} className="theme-toggle btn min-h-11 min-w-11 px-3 lg:min-h-10 lg:flex-1">
      <svg className="backlight-icon" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
        <rect className="backlight-screen" x="2.25" y="3.25" width="15.5" height="10.5" rx="2" />
        <path className="backlight-power" d="M10,6.2v2.4M7.6,7.4a3.2,3.2,0,1,0,4.8,0" />
        <path className="backlight-stand" d="M7.5,17h5M10,14v3" />
      </svg>
      {/* One phrase per theme; CSS shows the one that matches. Below desktop width only the icon shows. */}
      <span className="backlight-label backlight-label-on max-lg:sr-only">Backlight on</span>
      <span className="backlight-label backlight-label-off max-lg:sr-only">Backlight off</span>
    </button>
  );
}
