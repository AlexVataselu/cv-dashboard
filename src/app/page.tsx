import { BandHeading } from "@/components/BandHeading";
import { HOME_DESCRIPTION, pageMetadata } from "@/lib/site";
import { SectionShell } from "@/components/SectionShell";
import { ShippedWork } from "@/components/ShippedWork";
import { SkillGroups } from "@/components/SkillGroups";
import { YearsReceipt } from "@/components/YearsReceipt";
import { cv } from "@/content/cv";

export const metadata = pageMetadata({ description: HOME_DESCRIPTION, path: "/" });

const bleed = "-mx-5 px-5 md:-mx-10 md:px-10 xl:-mx-13 xl:px-13";

export default function Home() {
  const [total, ...rest] = cv.glance;
  return (
    <SectionShell
      current="overview"
      title="Overview"
      lead="A senior frontend engineer in Brașov with nine years on the web, the last five on React, Next.js, TypeScript and React Native."
    >
      {/* The total and its receipt */}
      <section aria-labelledby="glance" className={`mt-16 bg-band py-14 md:mt-24 md:py-20 ${bleed}`}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-10">
          <div className="flex flex-col">
            <BandHeading id="glance">Nine years on the web</BandHeading>
            <p className="rise mt-4 max-w-[40ch]">
              From Magento shops in 2017 to product teams at Pentalog and TryAngle Labs, with my own
              clients in between.
            </p>
            <div className="rise mt-12 lg:mt-auto lg:pt-16">
              <p className="display tnum text-giant leading-[0.8]">{total.value}</p>
              <p className="mt-3 text-lead font-semibold">{total.label}</p>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-3">
              {rest.map((g) => (
                <li key={g.label} className="rise">
                  <p className="display tnum text-head">{g.value}</p>
                  <p className="mt-1">{g.label}</p>
                </li>
              ))}
            </ul>
          </div>
          <YearsReceipt />
        </div>
      </section>

      {/* Results, each with where it happened */}
      <section aria-labelledby="impact" className="mt-24 md:mt-36">
        <BandHeading id="impact">Results with a source</BandHeading>
        <ul className="mt-10 grid gap-10 md:gap-12">
          {cv.impact.map((i) => (
            <li
              key={i.label}
              className="rise grid grid-cols-[minmax(0,1fr)] gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)] xl:items-end xl:gap-8"
            >
              <p className="display tnum text-[clamp(2.25rem,1rem+4.4vw,4.75rem)]">{i.value}</p>
              <div className="xl:pb-1">
                <p className="text-lead font-semibold leading-snug">{i.label}</p>
                <p className="mt-1 text-slate">{i.source}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <ShippedWork />

      {/* About, as a letter with a tear-off strip */}
      <section aria-labelledby="about" className={`mt-24 bg-ground-2 py-14 md:mt-36 md:py-20 ${bleed}`}>
        <div className="mx-auto max-w-[40rem]">
          <div className="rise scallop-bottom bg-band px-6 pt-8 md:px-14 md:pt-12">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export; the file is already sized */}
              <img
                src="/photo.webp"
                alt=""
                width={256}
                height={256}
                loading="lazy"
                decoding="async"
                className="size-11 rounded-full object-cover grayscale"
              />
              <h2 id="about" className="display text-head leading-none">
                About
              </h2>
            </div>
            <p className="mt-7 leading-[1.6]">{cv.about}</p>
            <p className="display mt-8 text-lead">{cv.name}</p>
            <p className="pb-6 text-small text-slate">{cv.title}</p>
          </div>
          <div className="rise perforation mt-2 flex flex-wrap items-center justify-between gap-4 bg-band px-6 py-5 md:px-14">
            <span className="font-semibold">{cv.email}</span>
            <a
              href={`mailto:${cv.email}`}
              className="press inline-flex min-h-12 items-center bg-ink px-5 font-semibold text-paper hover:bg-graphite"
            >
              Write to me
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="levels" className="mt-24 md:mt-36">
        <BandHeading id="levels">Skill levels</BandHeading>
        <p className="rise mt-4 max-w-[52ch]">
          Each level counts from the first dated role or project on the CV that uses the skill. Pick
          one to mark it across Experience and Projects.
        </p>
        <div className="mt-10">
          <SkillGroups headingLevel="h3" />
        </div>
      </section>
    </SectionShell>
  );
}
