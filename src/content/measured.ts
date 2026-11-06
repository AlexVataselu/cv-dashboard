/**
 * Results measured on the work itself, not claimed on the CV: what, where, how and when each was
 * measured, so a reader can check it. Kept apart from the CV's own results (cv.impact).
 * - Lighthouse: data/lighthouse-2026-11-05.json (Lighthouse 12.6.1, mobile, median of 3 runs).
 *   Only scores worth showing are listed; every site's full scores are in that file.
 * - Test counts: the test cases in each repository's own test files, counted 2026-11-05.
 * - Stremio: the measurements in the project's design spec (docs/superpowers/specs/
 *   2026-10-02-skip-recap-design.md, section 2, measured 2026-10-02).
 */
export interface MeasuredStat {
  value: string;
  label: string;
  /** the work it was measured on */
  source: string;
  /** the role it belongs to (its colour and its links), when it was done in a role */
  roleId?: string;
  /** the personal project it belongs to */
  projectId?: string;
  /** how and when it was measured */
  how: string;
}

const LH = "Lighthouse, mobile, median of 3 runs, Nov 2026";

export const measured: MeasuredStat[] = [
  {
    value: "23/23",
    label: "recap lines matched on a real episode, by its subtitles",
    source: "Stremio Skip Intro & Recap",
    projectId: "stremio",
    how: "Subtitle matching on MobLand S2E3, measured Oct 2026",
  },
  {
    value: "0/400",
    label: "false audio matches between unrelated episodes",
    source: "Stremio Skip Intro & Recap",
    projectId: "stremio",
    how: "Chromaprint over 181 cached episodes of 13 shows, Oct 2026",
  },
  {
    value: "340",
    label: "automated tests in the detection engine, with zero runtime dependencies",
    source: "Stremio Skip Intro & Recap",
    projectId: "stremio",
    how: "Test cases in the repository, Nov 2026",
  },
  {
    value: "100",
    label: "Lighthouse accessibility, best practices and SEO",
    source: "LocalsOnly v2",
    roleId: "freelance-2021",
    how: LH,
  },
  {
    value: "96 / 100",
    label: "Lighthouse accessibility and best practices, on both archive sites",
    source: "Azuga365 · Litoral în Lucru",
    roleId: "freelance-2025",
    how: LH,
  },
  {
    value: "216",
    label: "automated tests across the app and its libraries",
    source: "ReAMP",
    projectId: "reamp",
    how: "Test cases in the repository, Nov 2026",
  },
  {
    value: "96 · 100",
    label: "Lighthouse performance, then 100 for accessibility, best practices and SEO",
    source: "This CV dashboard",
    projectId: "cvdashboard",
    how: LH,
  },
  {
    value: "146 KB",
    label: "most first-load JavaScript on any page, under a 150 KB budget",
    source: "This CV dashboard",
    projectId: "cvdashboard",
    how: "Measured on every build",
  },
];
