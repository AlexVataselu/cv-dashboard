import { ArrowRightIcon } from "@/components/icons";

/**
 * How Stremio Skip Intro & Recap works, from the CV's description and the project's own README:
 * the player asks a detection engine on the same machine; the engine finds the intro by matching
 * audio fingerprints across a season and the recap by matching subtitle lines against earlier
 * episodes; the player shows a button for each. A diagram of the parts, not a picture of the UI.
 */
export function SkipIntroDiagram() {
  const arrow = (
    <span className="flex items-center justify-center py-1 text-muted lg:py-0" aria-hidden="true">
      <ArrowRightIcon className="icon rotate-90 lg:rotate-0" />
    </span>
  );
  return (
    <figure className="rounded-[10px] border border-border p-4 md:p-5" aria-labelledby="skip-diagram">
      <figcaption id="skip-diagram" className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[14px] font-semibold">How it works</span>
        <span className="pill pill-positive">Runs locally, no third-party database</span>
      </figcaption>
      <ol className="grid items-stretch lg:grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1.6fr)_1.5rem_minmax(0,1fr)]">
        <li className="flow-node">
          <span className="block text-[14px] font-semibold">Stremio player</span>
          <span className="mt-1 block text-[13px] text-muted">A fork of the Stremio desktop client (React) asks for the episode playing.</span>
        </li>
        <li aria-hidden="true">{arrow}</li>
        <li className="flow-node">
          <span className="block text-[14px] font-semibold">Detection engine, Node.js</span>
          <span className="mt-2 grid gap-2">
            <span className="block rounded-md bg-raised px-2.5 py-1.5 text-[13px]">
              <span className="font-medium">Intro:</span> ffmpeg reads the audio; Chromaprint fingerprints are matched across the season
            </span>
            <span className="block rounded-md bg-raised px-2.5 py-1.5 text-[13px]">
              <span className="font-medium">Recap:</span> subtitle lines matched against earlier episodes
            </span>
          </span>
        </li>
        <li aria-hidden="true">{arrow}</li>
        <li className="flow-node">
          <span className="block text-[14px] font-semibold">A button for each</span>
          <span className="mt-2 flex flex-wrap gap-2">
            <span className="pill">Skip Intro</span>
            <span className="pill">Skip Recap</span>
          </span>
        </li>
      </ol>
    </figure>
  );
}
