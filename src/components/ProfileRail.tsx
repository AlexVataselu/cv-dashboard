import { PaletteTrigger } from "@/components/PaletteTrigger";
import { cv } from "@/content/cv";

const secondary =
  "press inline-flex min-h-11 items-center justify-center bg-band-2 px-3 text-small font-semibold text-ink hover:bg-paper";

/**
 * The persistent profile: Alex's own city as the room (the BRAȘOV letters on Tâmpa, in greyscale
 * like the portrait on the printed CV) and the CV's warm grey portrait band as a card standing in it.
 */
export function ProfileRail() {
  return (
    <aside className="relative flex flex-col overflow-hidden bg-ground-2 lg:sticky lg:top-(--margin) lg:h-[calc(100svh-2*var(--margin))] lg:justify-end">
      <picture className="block h-44 w-full overflow-hidden md:h-60 lg:absolute lg:inset-0 lg:h-full">
        {/* Art-directed: a tall crop for the desktop column, a wide band around the letters below it. */}
        <source
          media="(min-width: 1024px)"
          type="image/avif"
          srcSet="/place/tampa-560.avif 560w, /place/tampa-960.avif 960w"
          sizes="31vw"
          width={960}
          height={1344}
        />
        <source
          media="(min-width: 1024px)"
          type="image/webp"
          srcSet="/place/tampa-560.webp 560w, /place/tampa-960.webp 960w"
          sizes="31vw"
          width={960}
          height={1344}
        />
        <source type="image/avif" srcSet="/place/tampa-band-800.avif 800w, /place/tampa-band-1200.avif 1200w" sizes="100vw" />
        <source type="image/webp" srcSet="/place/tampa-band-800.webp 800w, /place/tampa-band-1200.webp 1200w" sizes="100vw" />
        <img
          src="/place/tampa-band-800.webp"
          alt="The BRAȘOV letters on the forested slope of Tâmpa, the mountain over Brașov"
          width={1200}
          height={513}
          fetchPriority="high"
          decoding="async"
          className="drift h-full w-full object-cover object-[60%_45%] lg:object-[78%_14%]"
        />
      </picture>
      <div className="relative -mt-16 mx-3 bg-band p-5 md:mx-6 md:-mt-20 md:p-6 lg:m-(--margin) lg:p-7">
        <div className="flex items-end gap-4 lg:block">
          <picture className="enter block shrink-0" style={{ "--i": 0 } as React.CSSProperties}>
            <source srcSet="/photo.avif" type="image/avif" />
            <source srcSet="/photo.webp" type="image/webp" />
            <img
              src="/photo.webp"
              alt={cv.name}
              width={256}
              height={256}
              loading="eager"
              decoding="async"
              className="size-20 object-cover grayscale md:size-24 lg:mb-5 lg:size-36"
            />
          </picture>
          <div className="enter min-w-0" style={{ "--i": 1 } as React.CSSProperties}>
            <p className="display text-[clamp(2.25rem,1.6rem+2.4vw,3.25rem)]">{cv.name}</p>
            <p className="mt-2 font-semibold">{cv.title}</p>
          </div>
        </div>
        <div className="enter mt-4 grid gap-0.5" style={{ "--i": 2 } as React.CSSProperties}>
          {/* Hidden on phones, as the spec’s compact header has it; its ș would also pull Inter’s 85 KB latin-ext file onto the critical path. */}
          <p className="hidden text-slate md:block">{cv.location}</p>
          <p className="font-semibold">{cv.availability}</p>
        </div>
        <div className="enter mt-5 grid gap-2" style={{ "--i": 3 } as React.CSSProperties}>
          <a
            href={`mailto:${cv.email}`}
            className="press inline-flex min-h-12 items-center justify-center bg-ink px-4 font-semibold text-paper hover:bg-graphite"
          >
            Email me
          </a>
          <div className="flex flex-wrap gap-2 [&>*]:flex-1 [&>*]:whitespace-nowrap">
            <a href={cv.links.pdf} className={secondary}>
              CV PDF
            </a>
            <a href={cv.links.linkedin} className={secondary}>
              LinkedIn
            </a>
            <a href={cv.links.github} className={secondary}>
              GitHub
            </a>
            <PaletteTrigger />
          </div>
        </div>
      </div>
    </aside>
  );
}
