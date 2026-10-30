import type { ReactNode } from "react";

export function Panel({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="rounded-md border border-border bg-panel p-4 md:p-5">
      <h1 className="mb-4 border-b border-border pb-3 text-2xl font-bold tracking-tight text-heading md:text-3xl">
        {title}
      </h1>
      {children}
    </section>
  );
}
