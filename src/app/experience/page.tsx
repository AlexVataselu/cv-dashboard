import { CareerTimeline } from "@/components/CareerTimeline";
import { FilterNotice } from "@/components/FilterNotice";
import { LinkedStyles } from "@/components/LinkedStyles";
import { RoleCard } from "@/components/RoleCard";
import { RoleNav } from "@/components/RoleNav";
import { RoleSkills } from "@/components/RoleSkills";
import { SectionShell } from "@/components/SectionShell";
import { cv } from "@/content/cv";
import { AS_OF, roleYears } from "@/content/career";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Experience",
  description: "14 years building software, from backend work at Zega Software to frontend at Pentalog, TryAngle Labs and as an independent contractor: healthcare, fintech and cultural heritage products in React, Next.js, TypeScript and React Native.",
  path: "/experience",
});

/*
  The timeline is the navigator (7 columns), as tall as its rows: a role's row opens it in the side
  card (5 columns), the list of roles as <details>, newest first, one open at a time. Under the
  timeline, the open role's skills, each pressable to mark where else it was used. On one screen
  the side card scrolls inside itself and the opened role is brought into view there.
*/
export default function ExperiencePage() {
  const now = AS_OF;
  return (
    <SectionShell
      title="Experience"
      lead="Backend work first, then product teams at Pentalog and TryAngle Labs and my own clients in healthcare, fintech and cultural heritage."
    >
      <LinkedStyles />
      <RoleNav className="panel-grid ex linked">
        <CareerTimeline className="ex-tl span-7" />
        <RoleSkills className="ex-skills span-7" />
        <section aria-labelledby="roles" className="ex-roles card card-col span-5 p-0!">
          <div className="flex flex-wrap items-center justify-between gap-x-4 px-4 pt-4 pb-2">
            <h2 id="roles" className="card-title">
              Roles, newest first
            </h2>
            <FilterNotice />
          </div>
          <ol className="roles-list scroll-y @container border-t border-rule" data-roles-scroll="">
            {cv.roles.map((r) => (
              <li key={r.id}>
                <RoleCard role={r} years={roleYears(r, now)} />
              </li>
            ))}
            <li className="grid gap-x-6 gap-y-1 px-4 py-4 @xl:grid-cols-[9rem_minmax(0,1fr)] @xl:px-5">
              <span className="text-[14px] font-medium">Earlier</span>
              <span className="text-[14px]">
                {cv.earlier}
                {cv.earlierDetail ? <span className="mt-0.5 block text-muted">{cv.earlierDetail}</span> : null}
              </span>
            </li>
          </ol>
        </section>
      </RoleNav>
    </SectionShell>
  );
}
