import type { ProjectPoster } from "@/content/projectPosters";

const TONES: Record<ProjectPoster["tone"], string> = {
  mustard: "bg-mustard text-mustard-ink",
  blue: "bg-blue text-blue-ink",
  night: "bg-night text-night-ink",
};

/** A personal project's claim set as a poster in one of the page's three field colours. */
export function ProjectPosterPanel({
  poster,
  name,
  className = "",
  showName = true,
  large = false,
}: {
  poster: ProjectPoster;
  name: string;
  className?: string;
  showName?: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={`flex flex-col justify-end gap-4 ${large ? "aspect-[4/3] p-6 sm:aspect-[16/8] md:p-10 xl:aspect-[16/7]" : "aspect-[16/10] p-5 md:p-8"} ${TONES[poster.tone]} ${className}`}
    >
      <div>
        <p className={`display leading-[0.88] ${large ? "text-display" : "text-poster"}`}>{poster.big}</p>
        <p className="mt-3 max-w-[34ch] text-body font-semibold">{poster.small}</p>
      </div>
      {showName ? <p className="text-small font-semibold md:text-body">{name}</p> : null}
    </div>
  );
}
