import { CareerTimeline } from "@/components/CareerTimeline";
import { FilterNotice } from "@/components/FilterNotice";
import { RoleCard } from "@/components/RoleCard";
import { SectionShell } from "@/components/SectionShell";
import { cv } from "@/content/cv";
import { roleYears } from "@/content/career";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Experience",
  description: "Nine years of frontend work across Pentalog, TryAngle Labs and independent contracting: healthcare, fintech and cultural heritage products in React, Next.js, TypeScript and React Native.",
  path: "/experience",
});

export default function ExperiencePage() {
  const now = new Date().getFullYear();
  return (
    <SectionShell
      current="experience"
      title="Experience"
      lead="Product teams at Pentalog and TryAngle Labs, and my own clients in healthcare, fintech and cultural heritage."
    >
      <div className="mt-6">
        <CareerTimeline />
      </div>
      <section aria-labelledby="roles" className="mt-(--gap)">
        <div className="flex flex-wrap items-center justify-between gap-x-6">
          <h2 id="roles" className="card-title">
            Roles, newest first
          </h2>
          <FilterNotice />
        </div>
        <ol className="mt-3 overflow-hidden rounded-[10px] border border-border [&>li+li]:border-t [&>li+li]:border-rule">
          {cv.roles.map((r) => (
            <li key={r.id}>
              <RoleCard role={r} years={roleYears(r, now)} />
            </li>
          ))}
          <li className="grid gap-x-6 gap-y-1 px-4 py-4 md:grid-cols-[9rem_minmax(0,1fr)_10rem] md:px-5">
            <span className="text-[14px] font-medium">Before 2017</span>
            <span className="text-[14px] text-muted">{cv.before2017}</span>
          </li>
        </ol>
      </section>
    </SectionShell>
  );
}
