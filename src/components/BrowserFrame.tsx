/**
 * A real screenshot (AVIF/WebP, 640 and 1120 wide, 16:9) inside a plain browser frame whose
 * address bar names where it was captured. The frame is information, not ornament: it says the
 * picture is a live page and which one.
 * Callers claim 80vw on phones, so a 1.75x phone picks the 640px file: images that finish before
 * the first paint count in Lighthouse's simulated mobile LCP, and the 1120px files cost ~0.4 s there.
 * A thumbnail (`thumb`) drops the address bar and offers a 240px file, so a 120px slot at 2x
 * downloads ~3 KB instead of the 640px file.
 */
export function BrowserFrame({
  image,
  address,
  alt,
  sizes,
  eager = false,
  thumb = false,
}: {
  /** e.g. "/work/azuga365"; files are `${image}-640.avif` and so on */
  image: string;
  address: string;
  alt: string;
  sizes: string;
  /** true for the one image above the fold on its page: no lazy loading */
  eager?: boolean;
  /** a small thumbnail: the frame without its address bar, with a 240px file in the srcset */
  thumb?: boolean;
}) {
  const bar = !thumb;
  const widths = thumb ? [240, 640] : [640, 1120];
  const srcSet = (ext: string) => widths.map((w) => `${image}-${w}.${ext} ${w}w`).join(", ");
  return (
    <span className={bar ? "browser" : "browser rounded-md!"} data-ui="">
      {bar ? (
        <span className="browser-bar" aria-hidden="true">
          <span className="flex gap-1.5">
            <span className="size-2 rounded-full bg-control" />
            <span className="size-2 rounded-full bg-control" />
            <span className="size-2 rounded-full bg-control" />
          </span>
          <span className="browser-url">{address}</span>
        </span>
      ) : null}
      <picture>
        <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
        <img
          src={`${image}-${widths[0]}.webp`}
          alt={alt}
          width={1120}
          height={630}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="block aspect-video h-auto w-full object-cover object-top"
        />
      </picture>
    </span>
  );
}
