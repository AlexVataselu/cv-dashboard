import { BandHeading } from "@/components/BandHeading";
import { pageMetadata } from "@/lib/site";
import { SectionShell } from "@/components/SectionShell";
import { cv } from "@/content/cv";

export const metadata = pageMetadata({
  title: "Education",
  description: "Degrees and spoken languages of Alex Vataselu, Senior Frontend Engineer.",
  path: "/education",
});

function Photo({
  base,
  alt,
  width,
  height,
  sizes,
  caption,
}: {
  base: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  caption: React.ReactNode;
}) {
  return (
    <figure className="rise">
      <picture>
        <source type="image/avif" srcSet={`${base}-640.avif 640w, ${base}-1080.avif 1080w`} sizes={sizes} />
        <source type="image/webp" srcSet={`${base}-640.webp 640w, ${base}-1080.webp 1080w`} sizes={sizes} />
        <img
          src={`${base}-640.webp`}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </picture>
      <figcaption className="mt-3">{caption}</figcaption>
    </figure>
  );
}

export default function EducationPage() {
  return (
    <SectionShell
      current="education"
      title="Education"
      lead="Two degrees from the Romanian American University in Bucharest, and the two languages I work in."
    >
      <div className="mt-16 grid gap-16 md:mt-24 lg:grid-cols-2 lg:gap-12">
        <section aria-labelledby="degrees">
          <BandHeading id="degrees">Degrees</BandHeading>
          <ul className="mt-8 grid gap-8">
            {cv.education.map((e) => (
              <li key={e.degree} className="rise">
                <p className="display text-lead leading-tight">{e.degree}</p>
                <p className="mt-1">{e.school}</p>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="languages" className="bg-band p-6 md:p-8">
          <BandHeading id="languages">Languages</BandHeading>
          <ul className="mt-8 grid gap-6">
            {cv.languages.map((l) => (
              <li key={l.name} className="rise flex flex-wrap items-baseline justify-between gap-x-6">
                <p className="display text-lead">{l.name}</p>
                <p>{l.level}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="based" className="mt-24 md:mt-36">
        <BandHeading id="based">Where I work from</BandHeading>
        <p className="rise mt-4 max-w-[52ch]">
          My city in Romania, where I work remotely across the EU.
        </p>
        <div className="defer mt-10 grid items-start gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Photo
            base="/place/old-town"
            alt="The roofs of Brașov's old town seen from Tâmpa, between the cables of the cable car"
            width={1080}
            height={740}
            sizes="(min-width: 1024px) 36vw, (min-width: 768px) 55vw, 90vw"
            caption={
              <>
                The old town from Tâmpa, the mountain over the city. Photograph by Txllxt TxllxT,{" "}
                <a
                  className="text-ink underline underline-offset-2"
                  href="https://commons.wikimedia.org/wiki/File:Romania_-_Bra%C8%99ov_-_View_NW_on_Old_Town_from_Tampa_Mountain.jpg"
                >
                  CC BY-SA 4.0 via Wikimedia Commons
                </a>
                , in greyscale.
              </>
            }
          />
          <Photo
            base="/place/piata-1910"
            alt="An old postcard of a Brașov street with tram tracks and shop awnings, Tâmpa behind"
            width={1080}
            height={684}
            sizes="(min-width: 1024px) 22vw, (min-width: 768px) 35vw, 90vw"
            caption={
              <>
                The city under its German name, Kronstadt, on an old postcard.{" "}
                <a
                  className="text-ink underline underline-offset-2"
                  href="https://commons.wikimedia.org/wiki/File:Piata_Sfatului_Brasov_1910.jpg"
                >
                  Public domain via Wikimedia Commons
                </a>
                .
              </>
            }
          />
        </div>
      </section>
    </SectionShell>
  );
}
