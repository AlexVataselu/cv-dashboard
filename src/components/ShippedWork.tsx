import Link from "next/link";
import { cv } from "@/content/cv";
import { sites } from "@/content/sites";
import { SitesGallery } from "@/components/SitesGallery";

type Name = { name: string; href: string; external?: boolean; image?: string };

/** Every product and site on the CV as one paragraph of links; the live sites carry a frame of their front page. */
export function ShippedWork() {
  const project = (id: string) => cv.projects.find((p) => p.id === id)!.title.split(",")[0];
  const names: Name[] = [
    ...sites.map((s) => ({ name: s.name, href: s.url, external: true, image: s.image })),
    { name: "LocalsOnly", href: "/experience#role-freelance-2021" },
    { name: "Builder.ai", href: "/experience#role-pentalog" },
    { name: "TryAngle Labs", href: "/experience#role-tryangle" },
    { name: project("stremio"), href: "/projects#project-stremio" },
    { name: project("powderino"), href: "/projects#project-powderino" },
    { name: project("reamp"), href: "/projects#project-reamp" },
  ];
  const cls = "text-slate decoration-2 underline-offset-[0.18em] hover:text-ink hover:underline";
  return (
    <section aria-labelledby="shipped" className="mt-24 md:mt-36">
      <div className="rise text-[clamp(1.5rem,1rem+1.6vw,2.25rem)] font-semibold leading-[1.22] tracking-[-0.02em]">
        <h2 id="shipped" className="display inline text-[1em] leading-[1.22] tracking-[-0.02em]">
          Shipped work:{" "}
        </h2>
        <ul className="inline">
          {names.map((n, i) => (
            <li key={n.name} className="inline">
              {n.external ? (
                <a href={n.href} className={cls}>
                  {n.name}
                  {n.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- static export; the file is already sized
                    <img
                      src={`${n.image}-640.webp`}
                      alt=""
                      width={640}
                      height={360}
                      loading="lazy"
                      decoding="async"
                      className="frame-grow mx-[0.2em] inline-block h-[0.8em] w-[1.3em] bg-band object-cover object-top align-[-0.04em]"
                    />
                  ) : null}
                </a>
              ) : (
                <Link href={n.href} prefetch={false} className={cls}>
                  {n.name}
                </Link>
              )}
              {i < names.length - 1 ? ", " : "."}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-6 text-small text-slate">
        Client sites and platforms since 2021, personal projects since 2024.
      </p>
      <div className="mt-12">
        <SitesGallery />
      </div>
    </section>
  );
}
