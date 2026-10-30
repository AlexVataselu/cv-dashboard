import type { ReactNode } from "react";

export function Panel({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="rounded-md border border-border bg-panel p-4 md:p-5">
      <h1 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h1>
      {children}
    </section>
  );
}
