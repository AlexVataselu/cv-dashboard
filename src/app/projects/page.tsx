import { BrowserFrame } from "@/components/BrowserFrame";
import { FilterNotice } from "@/components/FilterNotice";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionShell } from "@/components/SectionShell";
import { cv } from "@/content/cv";
import { period } from "@/content/career";
import { sites } from "@/content/sites";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Projects",
  description: "Selected projects by Alex Vataselu, with stack and context: React Native apps, Next.js sites and developer tooling.",
  path: "/projects",
});

/* Client sites on a 6-column grid: the two newest take 3 columns each, the other three take 2. */
export default function ProjectsPage() {
  return (
    <SectionShell
      title="Projects"
      lead="Three things I build for myself, and five client sites I designed and built end to end."
    >
      <section aria-labelledby="personal" className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-x-6">
          <h2 id="personal" className="card-title">
            Personal projects
          </h2>
          <FilterNotice />
        </div>
        <div className="mt-3 grid gap-(--gap)">
          {/* The first card's screenshot is above the fold on desktop: it loads eagerly, the rest lazily. */}
          {cv.projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} eager={i === 0} />
          ))}
        </div>
      </section>

      <section aria-labelledby="sites" className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 id="sites" className="card-title">
            Client sites, live
          </h2>
          <p className="meta">Design in Figma, then the build, the tests and the launch.</p>
        </div>
        <ul className="mt-3 grid gap-(--gap) sm:grid-cols-2 lg:grid-cols-6">
          {sites.map((s, i) => {
            const role = cv.roles.find((r) => r.id === s.roleId);
            return (
              <li
                key={s.id}
                className={`${i < 2 ? "lg:col-span-3" : "lg:col-span-2"} ${i === 4 ? "sm:max-lg:col-span-2" : ""}`}
              >
                <a href={s.url} className="group card block p-3!">
                  <BrowserFrame
                    image={s.image}
                    address={s.domain}
                    alt={`Front page of ${s.domain}`}
                    sizes={
                      i < 2
                        ? "(min-width: 1024px) 40vw, (min-width: 640px) 45vw, 80vw"
                        : "(min-width: 1024px) 26vw, (min-width: 640px) 45vw, 80vw"
                    }
                  />
                  <span className="mt-3 flex items-baseline justify-between gap-3 px-1">
                    <span className="min-w-0 truncate text-[15px] font-semibold group-hover:underline">{s.name}</span>
                    {role ? <span className="tnum shrink-0 text-[13px] text-muted">{period(role)}</span> : null}
                  </span>
                  <span className="mt-0.5 block px-1 pb-1 text-[14px] text-muted">{s.note}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </SectionShell>
  );
}
