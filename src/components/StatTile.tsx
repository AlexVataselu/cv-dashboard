export function StatTile({
  value,
  label,
  source,
}: {
  value: string;
  label: string;
  source?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-bg p-3">
      <p className="mb-1 font-mono text-2xl font-bold leading-none text-heading">{value}</p>
      <p className="text-sm text-muted">{label}</p>
      {source ? <p className="mt-1 text-xs text-muted">{source}</p> : null}
    </div>
  );
}
