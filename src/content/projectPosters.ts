/**
 * Type-and-colour treatments for the three personal projects, which have no public screenshot yet.
 * Every word is taken from the project's description on the CV (cv.ts). These are posters of the
 * project's claim, not pictures of its interface.
 */
export type PosterTone = "mustard" | "blue" | "night";

export interface ProjectPoster {
  projectId: string;
  tone: PosterTone;
  /** the large line */
  big: string;
  /** the line under it */
  small: string;
}

export const projectPosters: ProjectPoster[] = [
  {
    projectId: "stremio",
    tone: "night",
    big: "Skip intro",
    small: "Audio fingerprints matched across a season. Runs locally.",
  },
  {
    projectId: "powderino",
    tone: "blue",
    big: "3,000+ resorts",
    small: "Ranked by fresh and incoming snow.",
  },
  {
    projectId: "reamp",
    tone: "mustard",
    big: "Spotify + YouTube",
    small: "One playback engine, two decks.",
  },
];

export const posterFor = (projectId: string) => projectPosters.find((p) => p.projectId === projectId);
