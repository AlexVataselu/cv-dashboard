"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "@/components/icons";
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
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "k") {
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
        aria-label="Search, Ctrl K: Open command palette"
        title="Search (Ctrl K)"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="btn hidden min-h-10 min-w-11 gap-1.5 px-2.5 text-muted hover:text-ink lg:inline-flex"
      >
        <SearchIcon className="icon size-[18px]" />
        <kbd className="palette-kbd" aria-hidden="true">
          Ctrl K
        </kbd>
      </button>
      {loaded ? <CommandPalette /> : null}
    </>
  );
}
