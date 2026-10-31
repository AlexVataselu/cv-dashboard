import { SitePlate } from "@/components/SitePlate";
import { sites } from "@/content/sites";

/** The five live client sites: the first one across the sheet, the other four two by two beneath it. */
export function SitesGallery() {
  const [first, ...others] = sites;
  return (
    <div className="defer grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <SitePlate site={first} sizes="(min-width: 1024px) 60vw, 90vw" />
      </div>
      {others.map((s) => (
        <SitePlate
          key={s.id}
          site={s}
          caption="name"
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
        />
      ))}
    </div>
  );
}
