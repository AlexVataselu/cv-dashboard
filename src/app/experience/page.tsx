import { CareerTimeline } from "@/components/CareerTimeline";
import { FilterNotice } from "@/components/FilterNotice";
import { RoleCard } from "@/components/RoleCard";
import { SectionShell } from "@/components/SectionShell";
import { cv } from "@/content/cv";
import { AS_OF, roleYears } from "@/content/career";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Experience",
  description: "14 years building software, from backend work at Zega Software to frontend at Pentalog, TryAngle Labs and as an independent contractor: healthcare, fintech and cultural heritage products in React, Next.js, TypeScript and React Native.",
  path: "/experience",
});

export default function ExperiencePage() {
  const now = AS_OF;
  return (
    <SectionShell
      title="Experience"
      lead="Backend work first, then product teams at Pentalog and TryAngle Labs and my own clients in healthcare, fintech and cultural heritage."
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
            <span className="text-[14px] font-medium">Earlier</span>
            <span className="text-[14px] text-muted">{cv.earlier}</span>
          </li>
        </ol>
      </section>
    </SectionShell>
  );
}
