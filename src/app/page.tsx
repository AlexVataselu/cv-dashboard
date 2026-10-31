import { BandHeading } from "@/components/BandHeading";
import { HOME_DESCRIPTION, pageMetadata } from "@/lib/site";
import { SectionShell } from "@/components/SectionShell";
import { SkillGroups } from "@/components/SkillGroups";
import { WorkIndex } from "@/components/WorkIndex";
import { YearsReceipt } from "@/components/YearsReceipt";
import { cv } from "@/content/cv";
import { sites } from "@/content/sites";

export const metadata = pageMetadata({ description: HOME_DESCRIPTION, path: "/" });

const bleed = "-mx-5 px-5 md:-mx-10 md:px-10 xl:-mx-13 xl:px-13";

/** The split sentence's frame: the five live sites pass through it, one every four seconds. */
function Reel() {
  return (
    <span className="relative hidden aspect-video w-[30%] shrink-0 overflow-hidden bg-band lg:block" aria-hidden="true">
      <span className="reel absolute inset-x-0 top-0 block h-[500%]">
        {sites.map((s) => (
          // eslint-disable-next-line @next/next/no-img-element -- static export; the file is already sized
          <img
            key={s.id}
            src={`${s.image}-640.webp`}
            alt=""
            width={640}
            height={360}
            loading="lazy"
            decoding="async"
            className="block h-1/5 w-full object-cover object-top"
          />
        ))}
      </span>
    </span>
  );
}

export default function Home() {
  const [total, ...rest] = cv.glance;
  const [user, domain] = cv.email.split("@");
  return (
    <SectionShell
      current="overview"
      title="Overview"
      lead="A senior frontend engineer with nine years on the web, the last five on React, Next.js, TypeScript and React Native."
    >
      <p className="display mt-14 flex items-center justify-between gap-6 text-poster md:mt-20">
        <span>Design</span>
        <Reel />
        <span className="text-right">to launch</span>
      </p>

      {/* One figure owns the field, with the receipt that adds up to it */}
      <section aria-labelledby="glance" className={`mt-16 bg-mustard py-14 text-mustard-ink md:mt-24 md:py-20 ${bleed}`}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-10">
          <div className="flex flex-col">
            <h2 id="glance" className="rise display text-head">
              Nine years on the web
            </h2>
            <p className="rise mt-4 max-w-[40ch] font-semibold">
              From Magento shops in 2017 to product teams at Pentalog and TryAngle Labs, with my own
              clients in between.
            </p>
            <div className="rise mt-12 lg:mt-auto lg:pt-16">
              <p className="display tnum text-giant leading-[0.78]">{total.value}</p>
              <p className="mt-3 text-lead font-semibold">{total.label}</p>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4">
              {rest.map((g) => (
                <li key={g.label} className="rise lg:flex lg:items-baseline lg:gap-4">
                  <p className="display tnum text-head lg:w-8 lg:shrink-0">{g.value}</p>
                  <p className="mt-1 font-semibold lg:mt-0">{g.label}</p>
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
        <ul className="mt-10 grid gap-20 md:gap-12">
          {cv.impact.map((i) => (
            <li
              key={i.label}
              className="rise grid grid-cols-[minmax(0,1fr)] gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)] xl:items-end xl:gap-8"
            >
              <p className="display tnum text-poster leading-[0.85] text-graphite">
                {i.value}
              </p>
              <div className="xl:pb-1">
                <p className="text-lead font-semibold leading-snug">{i.label}</p>
                <p className="mt-1 text-slate">{i.source}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <WorkIndex />

      {/* About, on a field of royal blue */}
      <section aria-labelledby="about" className={`mt-24 bg-blue py-14 text-blue-ink md:mt-36 md:py-20 ${bleed}`}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
          <h2 id="about" className="rise display text-display leading-[0.85]">
            About
          </h2>
          <div className="rise">
            <p className="text-lead leading-[1.5]">{cv.about}</p>
            <div className="mt-8 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export; the file is already sized */}
              <img
                src="/photo.webp"
                alt=""
                width={256}
                height={256}
                loading="lazy"
                decoding="async"
                className="size-12 rounded-full object-cover grayscale"
              />
              <div>
                <p className="font-semibold">{cv.name}</p>
                <p className="text-small text-blue-soft">{cv.title}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skill levels beside the city they were learned in */}
      <section aria-labelledby="levels" className="mt-24 md:mt-36">
        <div>
          <div>
            <BandHeading id="levels">Skill levels</BandHeading>
            <p className="rise mt-4 max-w-[52ch]">
              Each level counts from the first dated role or project on the CV that uses the skill.
              Pick one to mark it across Experience and Projects.
            </p>
            <div className="mt-10">
              <SkillGroups headingLevel="h3" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact: the address as the poster's last line */}
      <section aria-labelledby="contact" className={`mt-24 bg-night py-14 text-night-ink md:mt-36 md:py-20 ${bleed}`}>
        <h2 id="contact" className="rise text-lead font-semibold">
          Hiring a senior frontend engineer? Write to me.
        </h2>
        <a
          href={`mailto:${cv.email}`}
          className="rise display mt-16 block break-words text-poster leading-[0.92] decoration-4 underline-offset-8 hover:underline md:mt-28"
        >
          {user}@<wbr />
          {domain}
        </a>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-4 md:mt-20">
          <p className="font-semibold">Romania · Remote (EU)</p>
          <p className="flex flex-wrap gap-x-6 gap-y-2 font-semibold">
            <a href={cv.links.linkedin} className="underline underline-offset-4 hover:decoration-2">
              LinkedIn
            </a>
            <a href={cv.links.github} className="underline underline-offset-4 hover:decoration-2">
              GitHub
            </a>
            <a href={cv.links.pdf} className="underline underline-offset-4 hover:decoration-2">
              CV PDF
            </a>
          </p>
        </div>
      </section>
    </SectionShell>
  );
}
