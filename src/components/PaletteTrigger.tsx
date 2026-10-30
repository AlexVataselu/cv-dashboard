"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useUiStore } from "@/state/uiStore";

// Loaded only after the first open; the chunk stays out of the first-load JS.
const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

export function PaletteTrigger() {
  const open = useUiStore((s) => s.paletteOpen);
  const setOpen = useUiStore((s) => s.setPaletteOpen);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Mount the lazy chunk on first open (render-time update, not an effect).
  if (open && !loaded) setLoaded(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        useUiStore.getState().setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
    } else if (wasOpen.current) {
      wasOpen.current = false;
      ref.current?.focus();
    }
  }, [open]);

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label="Open command palette"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 font-mono text-sm text-text hover:border-muted"
      >
        <span aria-hidden="true">⌘K</span>
      </button>
      {loaded ? <CommandPalette /> : null}
    </>
  );
}
