"use client";

const root = () => document.documentElement;

function flip() {
  const next = root().dataset.theme === "light" ? "dark" : "light";
  root().dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Storage can be unavailable; the theme still switches for this page view.
  }
}

/**
 * The light switch: a desk lamp drawn in the same thin line as the dashboard's icons. Turning the
 * light on (the light theme) tilts the lamp's head down and a warm cone of light falls across the
 * button; turning it off (the dark theme, the default) lifts the head and the light fades.
 * Every state comes from CSS on data-theme, so the first paint is already right and nothing
 * changes at hydration; the button only flips the theme and remembers it.
 */
export function ThemeToggle() {
  return (
    <button type="button" onClick={flip} className="theme-toggle btn min-h-11 min-w-11 px-3 lg:min-h-10 lg:flex-1">
      <svg className="lamp" viewBox="0 0 28 28" width="26" height="26" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="lamp-beam" x1="0" y1="0" x2="1" y2="0.35">
            <stop offset="0" stopColor="#ffcf5c" stopOpacity="0.8" />
            <stop offset="0.55" stopColor="#ffcf5c" stopOpacity="0.28" />
            <stop offset="1" stopColor="#ffcf5c" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* The beam starts at the shade's mouth and runs out past the label (the button clips it). */}
        <path className="lamp-beam" d="M15.6,12.2L23.2,10.6L130,2L130,40L26,40Z" fill="url(#lamp-beam)" />
        <path className="lamp-line" d="M4.5,25.5h10M9.5,25.5v-1.3M9.5,24.2L6,14.5M6,14.5L13.8,7.6" />
        <circle className="lamp-joint" cx="6" cy="14.5" r="1.3" />
        <g className="lamp-head">
          <path className="lamp-shade" d="M12.6,5.6L19.4,4.1L23.2,10.6L15.6,12.2Z" />
          <circle className="lamp-bulb" cx="19.4" cy="11.6" r="1.7" />
        </g>
      </svg>
      {/* One phrase per theme; CSS shows the one that matches. Below desktop width only the lamp shows. */}
      <span className="lamp-label lamp-label-on max-lg:sr-only">Turn light on</span>
      <span className="lamp-label lamp-label-off max-lg:sr-only">Turn light off</span>
    </button>
  );
}
