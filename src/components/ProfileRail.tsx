import { PaletteTrigger } from "@/components/PaletteTrigger";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExternalIcon, FileIcon, GitHubIcon, LinkedInIcon, MailIcon, PinIcon } from "@/components/icons";
import { cv } from "@/content/cv";

const link =
  "flex min-h-11 items-center gap-2.5 rounded-lg px-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-active lg:min-h-10";

/**
 * The profile rail: the portrait, who, what, where and available at the top, and how to reach him
 * at its foot. It sits on the frame tint, held in place on wide screens while the sheet beside it
 * switches section. On a phone it folds into a compact header: the photo, the name, the title and
 * the contact buttons.
 */
export function ProfileRail() {
  return (
    <aside className="relative flex flex-col gap-4 px-4 pb-1 pt-4 md:px-6 md:pt-5 lg:sticky lg:top-0 lg:h-svh lg:gap-6 lg:overflow-y-auto lg:px-5 lg:py-6">
      <div className="flex items-center gap-4 lg:flex-col lg:items-start">
        <picture className="rail-photo block shrink-0">
          <source srcSet="/photo.avif" type="image/avif" />
          <source srcSet="/photo.webp" type="image/webp" />
          <img
            src="/photo.webp"
            alt={cv.name}
            width={400}
            height={400}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="size-16 rounded-[10px] bg-active object-cover md:size-20 lg:aspect-square lg:size-auto lg:w-full lg:rounded-xl"
          />
        </picture>
        {/* Below desktop the backlight switch sits top right: its width is kept clear here. */}
        <div className="grid min-w-0 gap-0.5 max-lg:pr-[7.5rem]">
          <p className="text-[20px] font-semibold leading-tight lg:text-[22px]">{cv.name}</p>
          <p className="text-[14px] text-muted">{cv.title}</p>
          {/* Hidden on phones, as the spec's compact header has it; its ș would also pull the
              text face's latin-ext file onto the critical path. */}
          <p className="hidden items-center gap-1.5 text-[13px] text-muted md:flex lg:mt-1">
            <PinIcon />
            <span>{cv.location}</span>
          </p>
          <p className="mt-1">
            <span className="pill pill-positive">
              <span className="dot text-positive" aria-hidden="true" />
              {cv.availability}
            </span>
          </p>
        </div>
      </div>

      {/* How to reach him, at the foot of the rail on a desktop. */}
      <div className="grid gap-2 md:flex md:items-center lg:mt-auto lg:grid">
        <a href={`mailto:${cv.email}`} className="btn btn-primary w-full md:w-auto lg:w-full">
          <MailIcon />
          Email me
        </a>
        <nav aria-label="Profile links" className="grid grid-cols-3 gap-1 md:flex lg:grid lg:grid-cols-1 lg:gap-0.5">
          <a href={cv.links.pdf} className={`${link} justify-center md:justify-start`}>
            <FileIcon />
            CV PDF
          </a>
          <a href={cv.links.linkedin} className={`${link} justify-center md:justify-start`}>
            <LinkedInIcon />
            <span className="lg:flex-1">LinkedIn</span>
            <ExternalIcon className="icon hidden text-muted lg:block" />
          </a>
          <a href={cv.links.github} className={`${link} justify-center md:justify-start`}>
            <GitHubIcon />
            <span className="lg:flex-1">GitHub</span>
            <ExternalIcon className="icon hidden text-muted lg:block" />
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-2 max-lg:absolute max-lg:right-4 max-lg:top-4 md:max-lg:right-6 md:max-lg:top-5">
        <ThemeToggle />
        <PaletteTrigger />
      </div>
    </aside>
  );
}
