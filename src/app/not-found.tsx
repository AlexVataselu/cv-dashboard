import Link from "next/link";
import { SectionShell } from "@/components/SectionShell";
import { ArrowRightIcon } from "@/components/icons";
import { SECTIONS } from "@/lib/sections";

export const metadata = { title: "Not found", robots: { index: false } };

/**
 * A mistyped or old link lands here, in the site's own frame and theme (Next's default 404 forced
 * white and black over the dark sheet). It names what happened and lists every section to go on to.
 */
export default function NotFound() {
  return (
    <SectionShell title="Nothing at this address" lead="The link may be mistyped or out of date. Every section of the CV is one click away.">
      <section aria-labelledby="nf-go" className="card max-w-[560px]">
        <h2 id="nf-go" className="card-title">
          Go to
        </h2>
        <ul className="mt-2 grid gap-1">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link href={s.href} prefetch={false} className="nf-link">
                <span>{s.label}</span>
                <ArrowRightIcon className="icon text-muted" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </SectionShell>
  );
}
