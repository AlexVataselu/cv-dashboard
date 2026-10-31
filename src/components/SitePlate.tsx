import type { Site } from "@/content/sites";

/** A screenshot of one of Alex's live sites, tipped onto the sheet like a plate, captioned with its name. */
export function SitePlate({
  site,
  sizes,
  caption = "full",
}: {
  site: Site;
  sizes: string;
  caption?: "full" | "name";
}) {
  return (
    <div className="rise">
      <a href={site.url} className="group block bg-band p-2 md:p-3">
        <picture>
          <source
            type="image/avif"
            srcSet={`${site.image}-640.avif 640w, ${site.image}-1120.avif 1120w`}
            sizes={sizes}
          />
          <source
            type="image/webp"
            srcSet={`${site.image}-640.webp 640w, ${site.image}-1120.webp 1120w`}
            sizes={sizes}
          />
          <img
            src={`${site.image}-640.webp`}
            alt={`Front page of ${site.domain}`}
            width={1120}
            height={630}
            loading="lazy"
            decoding="async"
            className="block aspect-video w-full object-cover object-top"
          />
        </picture>
        <span className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 px-1 pb-1" >
          <span className="font-semibold underline decoration-2 underline-offset-4 group-hover:decoration-4">
            {site.name}
          </span>
          {caption === "full" ? (
            <>
              <span className="text-small text-slate">{site.domain}</span>
              <span className="mt-1 block w-full text-small text-slate">{site.note}</span>
            </>
          ) : null}
        </span>
      </a>
    </div>
  );
}
