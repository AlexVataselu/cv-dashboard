"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cv } from "@/content/cv";
import { SECTIONS } from "@/lib/sections";
import { useUiStore } from "@/state/uiStore";

type Item = {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  run: () => void;
};

export default function CommandPalette() {
  const open = useUiStore((s) => s.paletteOpen);
  return open ? <PaletteDialog /> : null;
}

function PaletteDialog() {
  const setOpen = useUiStore((s) => s.setPaletteOpen);
  const selectSkill = useUiStore((s) => s.selectSkill);
  const router = useRouter();
  const titleId = useId();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState<"done" | "failed" | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => setOpen(false);

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => {
      setOpen(false);
      router.push(href);
    };
    return [
      ...SECTIONS.map((s) => ({
        id: `section-${s.id}`,
        label: s.label,
        hint: "Section",
        keywords: s.label,
        // Same hrefs as SectionNav: a selected skill travels with the jump.
        run: () => {
          const skill = useUiStore.getState().selectedSkill;
          go(skill ? `${s.href}?skill=${encodeURIComponent(skill)}` : s.href);
        },
      })),
      ...cv.skills.map((s) => ({
        id: `skill-${s.id}`,
        label: s.name,
        hint: "Skill",
        keywords: `${s.name} skill ${s.group}`,
        run: () => {
          selectSkill(s.id);
          go(`/skills?skill=${encodeURIComponent(s.id)}`);
        },
      })),
      {
        id: "copy-email",
        label: "Copy email",
        hint: "Action",
        keywords: "copy email contact",
        run: () => {
          const clip = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
          // Say so when the browser blocks the clipboard, rather than doing nothing.
          if (!clip) return setCopied("failed");
          void clip
            .writeText(cv.email)
            .then(() => setCopied("done"))
            .catch(() => setCopied("failed"));
        },
      },
    ];
  }, [router, selectSkill, setOpen]);

  const q = query.trim().toLowerCase();
  const results = q ? items.filter((i) => i.keywords.toLowerCase().includes(q)) : items;
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));
  const activeItem = results[activeIndex];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), copied === "failed" ? 4000 : 1500);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (!activeItem) return;
    document.getElementById(`${listId}-${activeItem.id}`)?.scrollIntoView?.({ block: "nearest" });
  }, [activeItem, listId]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length) setActive((activeIndex + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length) setActive((activeIndex - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      activeItem?.run();
    } else if (e.key === "Tab") {
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>("input, button");
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  // Rendered on <body>: the trigger lives in the sticky rail, whose stacking context would
  // otherwise trap the overlay under the sheet beside it, whatever its z-index.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-3 pt-[12vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        onMouseDown={(e) => {
          // Keep focus on the input so Esc/Tab handling and aria-activedescendant stay valid.
          if (e.target !== inputRef.current && !(e.target as HTMLElement).closest("button")) {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
        className="palette-in w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-border p-3">
          <h2 id={titleId} className="sr-only">
            Command palette
          </h2>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeItem ? `${listId}-${activeItem.id}` : undefined}
            aria-label="Search sections, skills and actions"
            placeholder="Search sections, skills, actions"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            className="min-h-10 min-w-0 flex-1 bg-transparent px-2 text-[15px] text-ink placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={close}
            className="btn min-h-9 px-3 text-[13px]"
          >
            Esc
          </button>
        </div>
        <ul id={listId} role="listbox" aria-label="Results" className="max-h-72 overflow-y-auto p-1">
          {results.map((item, i) => (
            <li
              key={item.id}
              id={`${listId}-${item.id}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseMove={() => setActive(i)}
              onClick={item.run}
              className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-[15px] text-ink aria-selected:bg-active"
            >
              <span>{item.label}</span>
              <span className="min-w-16 text-right text-[13px] text-muted">
                {item.id === "copy-email" && copied === "done"
                  ? "Copied"
                  : item.id === "copy-email" && copied === "failed"
                    ? `Copy blocked: ${cv.email}`
                    : item.hint}
              </span>
            </li>
          ))}
        </ul>
        {results.length === 0 ? (
          <p role="status" className="px-4 py-3 text-[15px] text-muted">
            No matches
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
