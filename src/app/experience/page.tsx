import { FilterNotice } from "@/components/FilterNotice";
import { pageMetadata } from "@/lib/site";
import { RoleCard } from "@/components/RoleCard";
import { SectionShell } from "@/components/SectionShell";
import { cv } from "@/content/cv";

export const metadata = pageMetadata({
  title: "Experience",
  description: "Nine years of frontend work across Pentalog, TryAngle Labs and independent contracting: healthcare, fintech and cultural heritage products in React, Next.js, TypeScript and React Native.",
  path: "/experience",
});

export default function ExperiencePage() {
  return (
    <SectionShell current="experience" title="Experience">
      <FilterNotice />
      <ol className="grid gap-3">
        {cv.roles.map((r) => (
          <li key={r.id}>
            <RoleCard role={r} />
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted">
        <span className="font-mono text-xs uppercase tracking-wider">Before 2017</span>
        {" · "}
        {cv.before2017}
      </p>
    </SectionShell>
  );
}
