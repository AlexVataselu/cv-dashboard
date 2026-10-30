import { PaletteTrigger } from "@/components/PaletteTrigger";
import { cv } from "@/content/cv";

const btn =
  "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium";
const outline = `${btn} border border-border text-text hover:border-muted`;

export function ProfileRail() {
  return (
    <aside className="border-b border-border bg-rail p-4 md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r md:p-4">
      <div className="flex items-center gap-3 md:block">
        <picture>
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
            className="size-14 rounded-full object-cover md:mb-2"
          />
        </picture>
        <div>
          <p className="text-base font-bold text-heading">{cv.name}</p>
          <p className="text-sm">{cv.title}</p>
        </div>
      </div>
      <p className="mt-1 hidden text-sm text-muted md:block">{cv.location}</p>
      <p className="mt-1 hidden font-mono text-xs text-accent md:mb-3 md:block">
        <span aria-hidden="true">● </span>
        {cv.availability.toLowerCase()}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 md:mt-0 md:flex-col md:items-stretch">
        <a href={`mailto:${cv.email}`} className={`${btn} bg-accent text-bg hover:brightness-110`}>
          Email me
        </a>
        <a href={cv.links.pdf} className={outline}>
          CV PDF
        </a>
        <PaletteTrigger />
        <div className="hidden gap-2 md:flex">
          <a href={cv.links.linkedin} className={`${outline} flex-1`}>
            LinkedIn
          </a>
          <a href={cv.links.github} className={`${outline} flex-1`}>
            GitHub
          </a>
        </div>
      </div>
    </aside>
  );
}
