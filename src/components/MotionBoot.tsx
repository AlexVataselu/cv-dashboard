"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

type Motion = typeof import("@/motion/enhance");
let motion: Motion | null = null;

/**
 * Loads the motion layer (src/motion/enhance.ts, with Motion) once the first page is idle, outside
 * the first-load JS. After that, each section switch staggers the new section's cards in; this runs
 * as a layout effect, inside the view transition's update, so the cards never flash before they move.
 * With prefers-reduced-motion: reduce nothing is loaded and every change is instant.
 */
export function MotionBoot() {
  const pathname = usePathname();
  const started = useRef(false);

  useLayoutEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!started.current) {
      started.current = true;
      const load = () =>
        import("@/motion/enhance").then((m) => {
          motion = m;
          m.boot();
        });
      if ("requestIdleCallback" in window) requestIdleCallback(load, { timeout: 2500 });
      else setTimeout(load, 300);
      return;
    }
    motion?.enter();
  }, [pathname]);

  return null;
}
