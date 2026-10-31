import type { CSSProperties } from "react";
import { PaletteTrigger } from "@/components/PaletteTrigger";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cv } from "@/content/cv";

const small =
  "press inline-flex min-h-11 items-center justify-center bg-ground-2 px-3 text-small font-semibold text-on-ground hover:bg-paper hover:text-ink";

/**
 * The pinned poster: the name set as the poster's title straight on the desk colour, held in place
 * while the sheet beside it changes section. Mustard desk with black type in the light theme,
 * black desk with mustard type in the dark one.
 */
export function ProfileRail() {
  return (
    <aside className="on-ground flex flex-col gap-6 px-5 pb-2 pt-3 text-on-ground md:px-10 lg:sticky lg:pl-13 lg:pr-0 lg:top-(--margin) lg:h-[calc(100svh-2*var(--margin))] lg:justify-between lg:gap-8 lg:py-2">
      <div>
        <p
          className="enter display poster-name max-w-[6ch] text-[clamp(4rem,0.6rem+5.6vw,6.75rem)] leading-[0.92]"
          style={{ "--i": 0 } as CSSProperties}
        >
          {cv.name}
        </p>
        <p className="enter mt-4 text-lead font-semibold" style={{ "--i": 1 } as CSSProperties}>
          {cv.title}
        </p>
      </div>
      {/* The city as the poster's picture, on wide screens only: phones keep their first load lean. */}
      <picture className="hidden min-h-0 flex-1 overflow-hidden lg:block">
        <source type="image/avif" srcSet="/place/tampa-560.avif 560w, /place/tampa-960.avif 960w" sizes="28vw" />
        <source type="image/webp" srcSet="/place/tampa-560.webp 560w, /place/tampa-960.webp 960w" sizes="28vw" />
        <img
          src="/place/tampa-560.webp"
          alt="The BRAȘOV letters on the forested slope of Tâmpa, the mountain over the city"
          width={960}
          height={1344}
          loading="lazy"
          decoding="async"
          className="drift h-full w-full object-cover object-[80%_20%]"
        />
      </picture>
      <div className="grid gap-5">
        <div className="enter flex items-center gap-4" style={{ "--i": 2 } as CSSProperties}>
          <picture className="block shrink-0">
            <source srcSet="/photo.avif" type="image/avif" />
            <source srcSet="/photo.webp" type="image/webp" />
            <img
              src="/photo.webp"
              alt={cv.name}
              width={256}
              height={256}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="size-20 object-cover grayscale md:size-24 lg:size-36"
            />
          </picture>
          <div className="grid gap-0.5">
            {/* Hidden on phones, as the spec's compact header has it; its ș would also pull the
                text face's latin-ext file onto the critical path. */}
            <p className="hidden text-on-ground-soft md:block">{cv.location}</p>
            <p className="font-semibold">{cv.availability}</p>
          </div>
        </div>
        <div className="enter grid gap-2" style={{ "--i": 3 } as CSSProperties}>
          <a
            href={`mailto:${cv.email}`}
            className="press inline-flex min-h-12 items-center justify-center bg-accent px-4 font-semibold text-accent-ink hover:bg-ink hover:text-paper"
          >
            Email me
          </a>
          <div className="flex flex-wrap gap-2 [&>*]:flex-1 [&>*]:whitespace-nowrap">
            <a href={cv.links.pdf} className={small}>
              CV PDF
            </a>
            <a href={cv.links.linkedin} className={small}>
              LinkedIn
            </a>
            <a href={cv.links.github} className={small}>
              GitHub
            </a>
          </div>
          <div className="flex gap-2 [&>*]:flex-1">
            <ThemeToggle className={small} />
            <PaletteTrigger />
          </div>
        </div>
      </div>
    </aside>
  );
}
