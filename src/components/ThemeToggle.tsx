"use client";

import { useRef, type PointerEvent } from "react";

const root = () => document.documentElement;

/** How far the bulb can be pulled down (px), and how far it must go to flip the light. */
const MAX_PULL = 18;
const FLIP_AT = 9;

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
 * The light switch: a bulb hanging on its cord. Pull the bulb down and let go to turn the light on
 * (the light theme) or off (the dark theme, the default); a click, Enter or Space does the same.
 * Its words and the lit bulb come from CSS on data-theme, so the first paint is already right and
 * nothing changes at hydration. The pull moves the bulb through a CSS variable, with no re-render.
 */
export function ThemeToggle() {
  const pull = useRef<{ startY: number; dy: number; id: number } | null>(null);
  const pulled = useRef(false);
  const button = useRef<HTMLButtonElement>(null);

  // The bulb moves down by dy and the cord (14px long) stretches to follow it.
  const setPull = (dy: number) => {
    button.current?.style.setProperty("--pull", `${dy}px`);
    button.current?.style.setProperty("--cord", String(1 + dy / 14));
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    pull.current = { startY: e.clientY, dy: 0, id: e.pointerId };
    pulled.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.dataset.pulling = "";
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const p = pull.current;
    if (!p || p.id !== e.pointerId) return;
    p.dy = Math.max(0, Math.min(MAX_PULL, e.clientY - p.startY));
    setPull(p.dy);
  };
  const release = (e: PointerEvent<HTMLButtonElement>) => {
    const p = pull.current;
    if (!p || p.id !== e.pointerId) return;
    pull.current = null;
    delete e.currentTarget.dataset.pulling;
    setPull(0);
    if (p.dy >= FLIP_AT) {
      // A real pull: flip now, and let the click that follows the pointerup do nothing.
      pulled.current = true;
      flip();
      swing();
    }
  };
  const swing = () => {
    const el = button.current;
    if (!el) return;
    el.removeAttribute("data-swing");
    void el.offsetWidth; // restart the animation
    el.setAttribute("data-swing", "");
  };
  const onClick = () => {
    if (pulled.current) {
      pulled.current = false;
      return;
    }
    flip();
    swing();
  };

  return (
    <button
      ref={button}
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={release}
      onPointerCancel={release}
      onAnimationEnd={(e) => e.currentTarget.removeAttribute("data-swing")}
      className="theme-toggle btn min-h-11 min-w-11 px-3 lg:min-h-10 lg:flex-1"
    >
      <svg className="lamp" viewBox="0 0 24 44" width="22" height="40" aria-hidden="true" focusable="false">
        <g className="lamp-hang">
          <line className="lamp-cord" x1="12" y1="0" x2="12" y2="14" />
          <g className="lamp-bulb">
            <rect className="lamp-cap" x="9" y="13" width="6" height="5" rx="1" />
            <circle className="lamp-glow" cx="12" cy="26" r="11" />
            <path
              className="lamp-glass"
              d="M12,18c-4.4,0-7,3.2-7,6.8c0,2.6,1.4,4.2,2.6,5.5c0.9,1,1.4,1.9,1.4,3.2h6c0-1.3,0.5-2.2,1.4-3.2c1.2-1.3,2.6-2.9,2.6-5.5C19,21.2,16.4,18,12,18Z"
            />
            {/* Path numbers are comma-separated, so no run of digits reads as a phone number. */}
            <path className="lamp-filament" d="M10,30.5v-3l2,1.6l2,-1.6v3" />
            <path className="lamp-base" d="M9.2,34.5h5.6M9.6,36.5h4.8M10.6,38.5h2.8" />
          </g>
        </g>
      </svg>
      {/* One phrase per theme; CSS shows the one that matches. Below desktop width only the bulb shows. */}
      <span className="lamp-label lamp-label-on max-lg:sr-only">Turn light on</span>
      <span className="lamp-label lamp-label-off max-lg:sr-only">Turn light off</span>
    </button>
  );
}
