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
    <SectionShell
      current="experience"
      title="Experience"
      lead="Product teams at Pentalog and TryAngle Labs, and my own clients in healthcare, fintech and cultural heritage. Newest first."
    >
      <FilterNotice />
      <ol className="mt-6 grid gap-16 md:gap-14">
        {cv.roles.map((r) => (
          <li key={r.id}>
            <RoleCard role={r} />
          </li>
        ))}
      </ol>
      <p className="rise mt-14 grid gap-3 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <span className="display text-lead text-graphite">Before 2017</span>
        <span>{cv.before2017}</span>
      </p>
    </SectionShell>
  );
}
