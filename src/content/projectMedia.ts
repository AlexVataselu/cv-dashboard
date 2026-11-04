import shotsJson from "./shots.json";

/**
 * What can honestly be shown for each personal project, as a small gallery of real screenshots.
 * - Stremio Skip Intro & Recap: the fork's stream list filters (resolution chips and a torrent site
 *   dropdown), captured from the fork (branch feature/stream-filters) built and served locally on
 *   2026-11-03, then the public fork on GitHub. Made by scripts/process-shots.mjs into shots.json.
 * - Powderino: six iOS screenshots Alex supplied on 2026-11-04 (portrait). No app UI is drawn or
 *   mocked here.
 * - ReAMP is deployed: its start screen was captured from re-amp.vercel.app (the homepage named
 *   on its public repository) on 2026-10-31; then Alex's own captures of the app signed in (2026-11-04).
 */
export interface Shot {
  /** e.g. "/work/reamp"; files are `${image}-${width}.avif` and `.webp` */
  image: string;
  /** the file widths that exist, smallest first */
  widths: number[];
  /** intrinsic size of the largest file, for the aspect ratio (no layout shift) */
  width: number;
  height: number;
  /** the short name on the gallery's switcher */
  label: string;
  alt: string;
  caption: string;
  /** browser: a page at an address; app: a desktop app window; phone: a portrait phone screen */
  frame: "browser" | "app" | "phone";
  /** what the frame's bar reads: the address, or the build the capture came from */
  address?: string;
  href?: string;
}

export interface ProjectMedia {
  projectId: string;
  shots: Shot[];
  links: { label: string; href: string; address: string }[];
}

type Processed = Omit<Shot, "frame" | "address" | "href">;
const shots = shotsJson as {
  stremio: Processed[];
  powderino: Processed[];
  reamp: Processed[];
  builderai: Processed[];
  innobyte: Processed[];
  localsonly: Processed[];
  cvdashboard: Processed[];
};

const FORK = "https://github.com/AlexVataselu/stremio-web";

export const projectMedia: ProjectMedia[] = [
  {
    projectId: "stremio",
    shots: [
      ...shots.stremio.map((s) => ({
        ...s,
        frame: "app" as const,
        address: "stremio-web fork · feature/stream-filters · run locally",
        href: `${FORK}/tree/feature/stream-filters`,
      })),
      {
        image: "/work/stremio-fork",
        widths: [640, 1120],
        width: 1120,
        height: 630,
        label: "On GitHub",
        frame: "browser",
        address: "github.com/AlexVataselu/stremio-web",
        alt: "The stremio-web fork on GitHub, branch feature/skip-recap, with commits that add the Skip Intro button",
        caption: "The player fork on GitHub, branch feature/skip-recap",
        href: `${FORK}/tree/feature/skip-recap`,
      },
    ],
    links: [
      { label: "Player fork", href: `${FORK}/tree/feature/skip-recap`, address: "github.com/AlexVataselu/stremio-web" },
    ],
  },
  {
    projectId: "powderino",
    shots: shots.powderino.map((s) => ({ ...s, frame: "phone" as const })),
    links: [],
  },
  {
    projectId: "reamp",
    shots: [
      {
        image: "/work/reamp",
        widths: [640, 1120],
        width: 1120,
        height: 630,
        label: "Start screen",
        frame: "browser",
        address: "re-amp.vercel.app",
        alt: "ReAMP's start screen: the ReAMP wordmark with Connect Spotify and Connect Google buttons",
        caption: "Start screen, live at re-amp.vercel.app",
        href: "https://re-amp.vercel.app",
      },
      ...shots.reamp.map((s) => ({
        ...s,
        frame: "browser" as const,
        address: "ReAMP · signed in",
        href: "https://re-amp.vercel.app",
      })),
    ],
    links: [
      { label: "Live app", href: "https://re-amp.vercel.app", address: "re-amp.vercel.app" },
      { label: "Repository", href: "https://github.com/AlexVataselu/ReAmp", address: "github.com/AlexVataselu/ReAmp" },
    ],
  },
  {
    // builder.ai is offline; these are its public pages from the Internet Archive, not the internal tools.
    projectId: "builderai",
    shots: shots.builderai.map((s, i) => ({
      ...s,
      frame: "browser" as const,
      address: i === 0 ? "builder.ai · archived Feb 2025" : "builder.ai/products/builder-studio · archived Jan 2025",
      href:
        i === 0
          ? "https://web.archive.org/web/20250201232535/https://www.builder.ai/"
          : "https://web.archive.org/web/20250124124515/https://www.builder.ai/products/builder-studio",
    })),
    links: [],
  },
  {
    // ElbilAppen's phone screens; Alex built the screens' UI and the map (TryAngle Labs, 2021).
    projectId: "innobyte",
    shots: shots.innobyte.map((s) => ({ ...s, frame: "phone" as const })),
    links: [],
  },
  {
    // Alex's Figma page designs: the deployed app needs its GraphQL API, which is no longer running.
    projectId: "localsonly",
    shots: shots.localsonly.map((s) => ({ ...s, frame: "app" as const, address: "LocalsOnly · Figma design" })),
    links: [
      { label: "Front end", href: "https://github.com/AlexVataselu/localsOnly", address: "github.com/AlexVataselu/localsOnly" },
      { label: "GraphQL API", href: "https://github.com/AlexVataselu/locals-only-api", address: "github.com/AlexVataselu/locals-only-api" },
    ],
  },
  {
    projectId: "cvdashboard",
    shots: shots.cvdashboard.map((s) => ({
      ...s,
      frame: "browser" as const,
      address: "alexvataselu.vercel.app",
      href: "https://alexvataselu.vercel.app",
    })),
    links: [
      { label: "Repository", href: "https://github.com/AlexVataselu/cv-dashboard", address: "github.com/AlexVataselu/cv-dashboard" },
    ],
  },
];

export const mediaFor = (projectId: string) => projectMedia.find((m) => m.projectId === projectId);
