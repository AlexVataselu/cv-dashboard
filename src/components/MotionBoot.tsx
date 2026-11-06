"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

type Motion = typeof import("@/motion/enhance");
type Interact = typeof import("@/motion/interact");
let motion: Motion | null = null;
let interact: Interact | null = null;

const idle = (fn: () => void) => ("requestIdleCallback" in window ? requestIdleCallback(fn, { timeout: 2500 }) : setTimeout(fn, 300));

/**
 * Loads two layers once the first page is idle, both outside the first-load JS:
 * - the interaction layer (src/motion/interact.ts: a year in focus, Play, a skill's thread, the site
 *   peek, the number keys), always: these are things to do, and they skip their own animations
 *   under prefers-reduced-motion;
 * - the motion layer (src/motion/enhance.ts, with Motion), only when motion is allowed. After that,
 *   each section switch staggers the new section's cards in; this runs as a layout effect, inside
 *   the view transition's update, so the cards never flash before they move.
 */
export function MotionBoot() {
  const pathname = usePathname();
  const started = useRef(false);

  useLayoutEffect(() => {
    if (!started.current) {
      started.current = true;
      idle(() =>
        import("@/motion/interact").then((m) => {
          interact = m;
          m.boot();
        }),
      );
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      idle(() =>
        import("@/motion/enhance").then((m) => {
          motion = m;
          m.boot();
        }),
      );
      return;
    }
    interact?.enter();
    motion?.enter();
  }, [pathname]);

  return null;
}
