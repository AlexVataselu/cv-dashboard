import Link from "next/link";
import { ProjectPosterPanel } from "@/components/ProjectPosterPanel";
import { cv } from "@/content/cv";
import { posterFor } from "@/content/projectPosters";
import { sites } from "@/content/sites";

type Row = {
  name: string;
  kind: string;
  href: string;
  external: boolean;
  image?: string;
  projectId?: string;
};

const KIND: Record<string, string> = {
  azuga365: "Cultural heritage archive · 2025",
  litoralinlucru: "Archive with filtered search · 2025",
  recuperareacasa: "Home-visit booking · 2021–2023",
  eyeexcellence: "Healthcare platform · 2021–2023",
  orlrasnov: "Healthcare platform · 2021–2023",
  stremio: "Desktop app feature · 2026",
  powderino: "iOS weather app · 2026",
  reamp: "Dual-deck DJ interface · since 2024",
};

function Picture({ row, sizes, showName = true }: { row: Row; sizes: string; showName?: boolean }) {
  if (row.image) {
    return (
      <picture>
        <source type="image/avif" srcSet={`${row.image}-640.avif 640w, ${row.image}-1120.avif 1120w`} sizes={sizes} />
        <source type="image/webp" srcSet={`${row.image}-640.webp 640w, ${row.image}-1120.webp 1120w`} sizes={sizes} />
        <img
          src={`${row.image}-640.webp`}
          alt={`Front page of ${row.name}`}
          width={1120}
          height={630}
          loading="lazy"
          decoding="async"
          className="block aspect-[16/10] w-full bg-band object-cover object-top"
        />
      </picture>
    );
  }
  const poster = row.projectId ? posterFor(row.projectId) : undefined;
  return poster ? <ProjectPosterPanel poster={poster} name={row.name} showName={showName} /> : null;
}

/**
 * Small index, large picture: every live site and personal project as one row. On a wide screen,
 * pointing at or focusing a row shows its picture in the one large frame beside the list (pure
 * CSS, see .work-index in globals.css); on a phone every row carries its own picture.
 */
export function WorkIndex() {
  const project = (id: string) => cv.projects.find((p) => p.id === id)!.title.split(",")[0];
  const rows: Row[] = [
    ...sites.map((s) => ({ name: s.name, kind: KIND[s.id], href: s.url, external: true, image: s.image })),
    ...["stremio", "powderino", "reamp"].map((id) => ({
      name: project(id),
      kind: KIND[id],
      href: `/projects#project-${id}`,
      external: false,
      projectId: id,
    })),
  ];
  return (
    <section aria-labelledby="work" className="work-index defer mt-28 md:mt-44">
      <h2 id="work" className="rise display text-display leading-[0.88]">
            Shipped work
          </h2>
      <p className="rise mt-5 max-w-[44ch]">
            Five live client sites I designed and built end to end, and three projects of my own.
          </p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
        <div>
          <ul className="grid gap-1">
            {rows.map((r, i) => {
              const inner = (
                <>
                  <span className="display text-head leading-none">{r.name}</span>
                  <span className="text-small text-slate group-hover:text-current">{r.kind}</span>
                </>
              );
              const cls =
                "work-row group flex min-h-14 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-3 py-3 transition-colors duration-200 hover:bg-accent hover:text-accent-ink focus-visible:bg-accent focus-visible:text-accent-ink";
              return (
                <li key={r.name} className="rise">
                  <div className="mb-2 mt-8 lg:hidden">
                    <Picture row={r} sizes="90vw" showName={false} />
                  </div>
                  {r.external ? (
                    <a href={r.href} data-i={i} className={cls}>
                      {inner}
                    </a>
                  ) : (
                    <Link href={r.href} prefetch={false} data-i={i} className={cls}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-8 aspect-[16/10] w-full overflow-hidden">
            {rows.map((r, i) => (
              <div key={r.name} data-i={i} className="work-preview absolute inset-0" aria-hidden="true">
                <Picture row={r} sizes="40vw" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
