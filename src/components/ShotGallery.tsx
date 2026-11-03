import type { Shot } from "@/content/projectMedia";
import { BrowserFrame } from "@/components/BrowserFrame";

const SIZES = "(min-width: 1440px) 460px, (min-width: 1024px) 40vw, (min-width: 640px) 92vw, 80vw";

function Frame({ shot, eager }: { shot: Shot; eager: boolean }) {
  if (shot.frame === "phone") {
    const srcSet = (ext: string) => shot.widths.map((w) => `${shot.image}-${w}.${ext} ${w}w`).join(", ");
    return (
      <span className="phone" data-ui="">
        <picture>
          <source type="image/avif" srcSet={srcSet("avif")} sizes="240px" />
          <source type="image/webp" srcSet={srcSet("webp")} sizes="240px" />
          <img
            src={`${shot.image}-${shot.widths[0]}.webp`}
            alt={shot.alt}
            width={shot.width}
            height={shot.height}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="block h-auto w-full"
            style={{ aspectRatio: `${shot.width} / ${shot.height}` }}
          />
        </picture>
      </span>
    );
  }
  return (
    <BrowserFrame
      image={shot.image}
      address={shot.address ?? ""}
      alt={shot.alt}
      sizes={SIZES}
      eager={eager}
      widths={shot.widths}
      width={shot.width}
      height={shot.height}
      app={shot.frame === "app"}
    />
  );
}

/**
 * A project's real screenshots, one at a time, with a switcher above them. The switcher is a group
 * of radios (no JS: CSS shows the checked one's figure; arrow keys move between them and a screen
 * reader reads "On GitHub, 4 of 4"). Hidden figures are display:none, so their lazy images are not
 * fetched until chosen. Every figure has the same aspect within a gallery, so switching shifts
 * nothing; each says what it shows in its caption. Without JS it works the same way.
 */
export function ShotGallery({ id, title, shots, eager = false }: { id: string; title: string; shots: Shot[]; eager?: boolean }) {
  if (shots.length === 0) return null;
  const name = `shot-${id}`;
  const many = shots.length > 1;
  return (
    <div className={`gallery ${shots[0].frame === "phone" ? "gallery-phone" : ""}`}>
      {many ? (
        <fieldset className="seg gallery-tabs">
          <legend className="sr-only">Screenshots of {title}</legend>
          {shots.map((s, i) => (
            <label key={s.image}>
              <input type="radio" name={name} value={String(i)} defaultChecked={i === 0} aria-controls={`${name}-${i}`} />
              {s.label}
            </label>
          ))}
        </fieldset>
      ) : null}
      <div className="gallery-stage">
        {shots.map((s, i) => (
          <figure key={s.image} id={`${name}-${i}`} className="shot" data-shot={i}>
            {s.href ? (
              <a href={s.href} className="block">
                <Frame shot={s} eager={eager && i === 0} />
              </a>
            ) : (
              <Frame shot={s} eager={eager && i === 0} />
            )}
            <figcaption className="mt-2 flex gap-2 text-[13px] text-muted">
              {many ? (
                <span className="tnum shrink-0">
                  {i + 1}/{shots.length}
                </span>
              ) : null}
              <span>{s.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
