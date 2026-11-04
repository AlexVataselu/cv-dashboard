"use client";

import { useSyncExternalStore } from "react";

const root = () => document.documentElement;

function onThemeChange(notify: () => void) {
  const observer = new MutationObserver(notify);
  observer.observe(root(), { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const backlightOn = () => root().dataset.theme === "light";

function setTheme(next: "light" | "dark") {
  root().dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Storage can be unavailable; the theme still switches for this page view.
  }
}

/**
 * The CRT-style reveal, as clip-path keyframes for the Web Animations API. The page is a
 * View Transition snapshot, so each frame only clips an already-drawn picture: no repaint of the
 * page and no gradient mask. `inset(top right bottom left)` around the point (x, y):
 * a point, then a line across the screen (2px tall), then the whole screen.
 */
function crtFrames(x: number, y: number, w: number, h: number) {
  const point = `inset(${y}px ${w - x}px ${h - y}px ${x}px)`;
  const dot = `inset(${y - 1}px ${w - x - 4}px ${h - y - 1}px ${x - 4}px)`;
  const line = `inset(${y - 1}px 0px ${h - y - 1}px 0px)`;
  const full = "inset(0px 0px 0px 0px)";
  return { point, dot, line, full };
}

const ON_MS = 1100;
const OFF_MS = 640;

/**
 * The dashboard's backlight. Switching it on (the light theme) lights the screen like a CRT: a
 * point in the middle of the panel stretches into a bright line, which opens up and down to fill
 * the screen; switching off (the dark theme, the default) closes the picture to a line, then a
 * point. Without the View Transitions API, or with reduced motion, the theme just switches.
 * The button says its state, "Backlight OFF" or "Backlight ON": while off it breathes a soft glow
 * to be noticed; on, it looks switched on. Its words and look come from CSS on data-theme, so the
 * first paint is already right; aria-pressed follows the theme after hydration.
 */
export function ThemeToggle() {
  const on = useSyncExternalStore(onThemeChange, backlightOn, () => false);
  const toggle = () => {
    const next = root().dataset.theme === "light" ? "dark" : "light";
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || typeof document.startViewTransition !== "function") {
      setTheme(next);
      return;
    }
    // The light comes from the middle of the dashboard panel (the "screen").
    const sheet = document.querySelector(".sheet")?.getBoundingClientRect();
    const w = innerWidth;
    const h = innerHeight;
    const x = Math.round(sheet ? sheet.left + sheet.width / 2 : w / 2);
    const y = Math.round(sheet ? sheet.top + Math.min(sheet.height, h) / 2 : h / 2);
    root().style.setProperty("--bl-x", `${x}px`);
    root().dataset.backlight = next === "light" ? "on" : "off";

    const transition = document.startViewTransition(() => setTheme(next));
    let sweep: Animation | undefined;
    transition.ready
      .then(() => {
        const { point, dot, line, full } = crtFrames(x, y, w, h);
        if (next === "light") {
          // clip-path only (no filter): a filter on the snapshot would force it to be re-rendered.
          sweep = root().animate(
            [
              { clipPath: point, offset: 0, easing: "ease-out" },
              { clipPath: dot, offset: 0.06, easing: "cubic-bezier(0.65, 0, 0.35, 1)" },
              { clipPath: line, opacity: 1, offset: 0.34, easing: "step-end" },
              { clipPath: line, opacity: 0.45, offset: 0.38, easing: "step-end" },
              { clipPath: line, opacity: 1, offset: 0.42, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
              { clipPath: full, opacity: 1, offset: 1 },
            ],
            { duration: ON_MS, fill: "both", pseudoElement: "::view-transition-new(root)" },
          );
        } else {
          sweep = root().animate(
            [
              { clipPath: full, offset: 0, easing: "cubic-bezier(0.7, 0, 0.84, 0)" },
              { clipPath: line, opacity: 1, offset: 0.55, easing: "cubic-bezier(0.55, 0, 0.9, 0.35)" },
              { clipPath: dot, opacity: 1, offset: 0.9, easing: "ease-in" },
              { clipPath: point, opacity: 0, offset: 1 },
            ],
            { duration: OFF_MS, fill: "both", pseudoElement: "::view-transition-old(root)" },
          );
        }
      })
      .catch(() => {
        // A skipped transition still switched the theme.
      });
    transition.finished.finally(() => {
      // The sweep targets <html> through a pseudo-element, so with fill: "both" it would outlive
      // the transition and grip the next one's snapshots (a finished "off" sweep holds opacity 0,
      // which hid the dark page at the start of the next "on": a white flash). Drop it here.
      sweep?.cancel();
      delete root().dataset.backlight;
    });
  };

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={toggle}
      className="theme-toggle btn min-h-11 px-3 whitespace-nowrap max-lg:px-2.5 max-lg:text-[13px] lg:min-h-10 lg:flex-1"
    >
      {/* The current state; CSS shows the phrase that matches data-theme. */}
      <span className="backlight-state backlight-state-off">
        Backlight <b>OFF</b>
      </span>
      <span className="backlight-state backlight-state-on">
        Backlight <b>ON</b>
      </span>
    </button>
  );
}
