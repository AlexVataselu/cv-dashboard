"use client";

import { useEffect, useState } from "react";
import { onCLS, onINP, onLCP } from "web-vitals";
import lastAudit from "../../data/last-audit.json";
import { firstLoadJsKb } from "@/lib/buildStats";

export type Audit = {
  date: string | null;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  } | null;
};

const PLACEHOLDER = "–";

function Vital({ name, value, width }: { name: string; value: string | null; width: string }) {
  return (
    <span role="group" aria-label={name}>
      {name}{" "}
      <span className="inline-block text-left tabular-nums" style={{ minWidth: width }}>
        {value ?? PLACEHOLDER}
      </span>
    </span>
  );
}

export function StatusBar({
  audit = lastAudit as Audit,
  jsKb = firstLoadJsKb,
}: {
  audit?: Audit;
  jsKb?: number;
}) {
  const [lcp, setLcp] = useState<number | null>(null);
  const [cls, setCls] = useState<number | null>(null);
  const [inp, setInp] = useState<number | null>(null);

  useEffect(() => {
    // reportAllChanges: show values as they settle, so a visitor who never leaves or
    // hides the tab still sees numbers instead of placeholders.
    const opts = { reportAllChanges: true };
    onLCP((m) => setLcp(m.value), opts);
    onCLS((m) => setCls(m.value), opts);
    onINP((m) => setInp(m.value), opts);
  }, []);

  const { date, scores } = audit;
  const auditText =
    date && scores
      ? `last audit ${date} · ${scores.performance}/${scores.accessibility}/${scores.bestPractices}/${scores.seo}`
      : "audit pending";

  return (
    <footer
      aria-label="Site performance"
      className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-panel px-3 py-2 font-mono text-xs text-muted md:px-4"
    >
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-accent" />
        <span>{auditText}</span>
      </span>
      <span>{`JS ~${Math.round(jsKb)} KB`}</span>
      <Vital name="LCP" value={lcp === null ? null : `${(lcp / 1000).toFixed(1)}s`} width="4ch" />
      <Vital name="CLS" value={cls === null ? null : cls.toFixed(2)} width="4ch" />
      <Vital name="INP" value={inp === null ? null : `${Math.round(inp)}ms`} width="6ch" />
    </footer>
  );
}
