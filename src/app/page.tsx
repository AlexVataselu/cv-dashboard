import { BandHeading } from "@/components/BandHeading";
import { pageMetadata } from "@/lib/site";
import { SectionShell } from "@/components/SectionShell";
import { SkillGroups } from "@/components/SkillGroups";
import { StatTile } from "@/components/StatTile";
import { cv } from "@/content/cv";

export const metadata = pageMetadata({
  description:
    "Senior Frontend Engineer in Brașov, Romania, working remotely across the EU. 9 years building for the web with React, Next.js, TypeScript and React Native.",
  path: "/",
});

export default function Home() {
  return (
    <SectionShell current="overview" title="Overview">
      <BandHeading>At a glance</BandHeading>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {cv.glance.map((g) => (
          <StatTile key={g.label} value={g.value} label={g.label} />
        ))}
      </div>
      <BandHeading>Impact</BandHeading>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-5">
        {cv.impact.map((i) => (
          <StatTile key={i.label} value={i.value} label={i.label} source={i.source} />
        ))}
      </div>
      <BandHeading>About</BandHeading>
      <p className="max-w-[64ch] text-base text-heading">{cv.about}</p>
      <BandHeading>Skill levels</BandHeading>
      <SkillGroups headingLevel="h3" />
    </SectionShell>
  );
}
