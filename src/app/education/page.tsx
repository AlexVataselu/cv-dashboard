import { BandHeading } from "@/components/BandHeading";
import { SectionShell } from "@/components/SectionShell";
import { cv } from "@/content/cv";

export default function EducationPage() {
  return (
    <SectionShell current="education" title="Education">
      <BandHeading>Degrees</BandHeading>
      <ul className="grid gap-3">
        {cv.education.map((e) => (
          <li key={e.degree} className="rounded-md border border-border bg-bg p-3">
            <p className="text-base font-semibold text-heading">{e.degree}</p>
            <p className="text-sm text-muted">{e.school}</p>
          </li>
        ))}
      </ul>
      <BandHeading>Languages</BandHeading>
      <ul className="grid gap-3">
        {cv.languages.map((l) => (
          <li key={l.name} className="rounded-md border border-border bg-bg p-3">
            <p className="text-base font-semibold text-heading">{l.name}</p>
            <p className="text-sm text-muted">{l.level}</p>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
