/**
 * What can honestly be shown for each personal project.
 * - ReAMP is deployed: its start screen was captured from re-amp.vercel.app (the homepage named
 *   on its public repository) on 2026-10-31.
 * - Stremio Skip Intro & Recap runs on the user's own machine, so there is no public page of it;
 *   its player fork is public on GitHub, captured on the branch that carries the feature.
 * - Powderino has no public page or repository yet: it is shown by its facts from the CV.
 */
export interface ProjectMedia {
  projectId: string;
  shot?: { image: string; address: string; alt: string; caption: string; href: string };
  links: { label: string; href: string; address: string }[];
}

export const projectMedia: ProjectMedia[] = [
  {
    projectId: "stremio",
    shot: {
      image: "/work/stremio-fork",
      address: "github.com/AlexVataselu/stremio-web",
      alt: "The stremio-web fork on GitHub, branch feature/skip-recap, with commits that add the Skip Intro button",
      caption: "The player fork on GitHub, branch feature/skip-recap",
      href: "https://github.com/AlexVataselu/stremio-web/tree/feature/skip-recap",
    },
    links: [
      {
        label: "Player fork",
        href: "https://github.com/AlexVataselu/stremio-web/tree/feature/skip-recap",
        address: "github.com/AlexVataselu/stremio-web",
      },
    ],
  },
  { projectId: "powderino", links: [] },
  {
    projectId: "reamp",
    shot: {
      image: "/work/reamp",
      address: "re-amp.vercel.app",
      alt: "ReAMP's start screen: the ReAMP wordmark with Connect Spotify and Connect Google buttons",
      caption: "Start screen, live at re-amp.vercel.app",
      href: "https://re-amp.vercel.app",
    },
    links: [
      { label: "Live app", href: "https://re-amp.vercel.app", address: "re-amp.vercel.app" },
      { label: "Repository", href: "https://github.com/AlexVataselu/ReAmp", address: "github.com/AlexVataselu/ReAmp" },
    ],
  },
];

export const mediaFor = (projectId: string) => projectMedia.find((m) => m.projectId === projectId);
