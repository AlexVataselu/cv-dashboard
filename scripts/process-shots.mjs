// Turns the real screenshots Alex supplies into the site's image files and the gallery manifest.
// A dev tool, not part of the build: run it when a folder of shots changes.
//
//   node scripts/process-shots.mjs [shotsDir]
//
// shotsDir defaults to E:\WorkAV\cv\.superpowers\sdd\2026-10-30-cv-dashboard\shots and holds:
// - stremio/   the stremio-web fork's stream list (1440x900 captures). Each file listed in STREMIO is
//              cropped to the right-hand stream panel (the feature) and written at its native 640px,
//              so nothing is upscaled; the cast row (Cinemeta's data, with an encoding glitch) is left out.
// - powderino/ iOS screenshots (portrait). Only files named in powderino/captions.json are used, so
//              every picture has a caption Alex wrote: { "file.png": { "alt": "...", "caption": "..." } }.
//              Each becomes 320px and 640px wide, its own aspect kept.
// - reamp/     desktop captures of ReAMP signed in, listed in REAMP; cut to 16:9 from the top, 640 and 1120px.
// Output: public/work/<id>-<width>.{avif,webp} and src/content/shots.json (read by projectMedia.ts).
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// sharp ships with Next.js; it is not a dependency of this project.
const require = createRequire(createRequire(join(root, "package.json")).resolve("next"));
const sharp = require("sharp");

const shotsDir = process.argv[2] ?? "E:/WorkAV/cv/.superpowers/sdd/2026-10-30-cv-dashboard/shots";
const outDir = join(root, "public", "work");

/** Captured 2026-11-03 from the fork (branch feature/stream-filters, ad4db65f), served locally; see the folder's README. */
const STREMIO = [
  {
    file: "1-stream-list-filters.png",
    id: "stremio-filters",
    label: "Filters",
    alt: "Stremio's stream list with the fork's filters above it: an All sites dropdown and resolution chips with counts (All, 4K 5, 1080p 23, 720p 7)",
    caption: "Resolution chips with stream counts, and a torrent site dropdown, above the stream list",
  },
  {
    file: "2-torrent-site-dropdown.png",
    id: "stremio-sites",
    label: "Site dropdown",
    alt: "The torrent site dropdown open over the stream list, listing sites with their stream counts: ThePirateBay 17, Rutracker 7, 1337x 5 and more",
    caption: "The torrent site dropdown, each site with its number of streams",
  },
  {
    file: "3-1080p-filter-applied.png",
    id: "stremio-1080p",
    label: "1080p",
    alt: "The 1080p chip selected, with the stream list narrowed to 1080p streams",
    caption: "The 1080p chip selected: the list keeps only 1080p streams",
  },
];
/** The stream panel (x 1020 to 1440) with a little of the title art at its left, as a 16:9 crop. */
const STREMIO_CROP = { left: 800, top: 60, width: 640, height: 360 };

async function write(img, id, width) {
  const base = join(outDir, `${id}-${width}`);
  await img.clone().avif({ quality: 55, effort: 6 }).toFile(`${base}.avif`);
  await img.clone().webp({ quality: 78 }).toFile(`${base}.webp`);
}

const manifest = { stremio: [], powderino: [] };

for (const s of STREMIO) {
  const src = join(shotsDir, "stremio", s.file);
  if (!existsSync(src)) {
    console.warn(`missing ${src}: skipped`);
    continue;
  }
  const img = sharp(src).extract(STREMIO_CROP);
  await write(img, s.id, STREMIO_CROP.width);
  manifest.stremio.push({
    image: `/work/${s.id}`,
    widths: [STREMIO_CROP.width],
    width: STREMIO_CROP.width,
    height: STREMIO_CROP.height,
    label: s.label,
    alt: s.alt,
    caption: s.caption,
  });
  console.log(`stremio: ${s.file} -> ${s.id}`);
}

const pDir = join(shotsDir, "powderino");
const captionsFile = join(pDir, "captions.json");
const captions = existsSync(captionsFile) ? JSON.parse(readFileSync(captionsFile, "utf8")) : {};
const pFiles = existsSync(pDir) ? readdirSync(pDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort() : [];
for (const [i, f] of pFiles.entries()) {
  const c = captions[f];
  if (!c?.alt || !c?.caption) {
    console.warn(`powderino: ${f} has no alt and caption in captions.json: skipped`);
    continue;
  }
  const id = `powderino-${i + 1}`;
  const meta = await sharp(join(pDir, f)).metadata();
  if (meta.height <= meta.width) console.warn(`powderino: ${f} is not portrait`);
  for (const w of [320, 640]) await write(sharp(join(pDir, f)).resize({ width: w }), id, w);
  manifest.powderino.push({
    image: `/work/${id}`,
    widths: [320, 640],
    width: 640,
    height: Math.round((meta.height / meta.width) * 640),
    label: c.label ?? `Screen ${manifest.powderino.length + 1}`,
    alt: c.alt,
    caption: c.caption,
  });
  console.log(`powderino: ${f} -> ${id}`);
}

/** Alex's desktop captures of ReAMP signed in (2026-11-04), cut to 16:9 from the top. */
const REAMP = [
  {
    file: "1-decks.png",
    label: "Decks",
    alt: "ReAMP signed in: a playlist mixing Spotify and YouTube tracks on the left, a video player, and Deck A and Deck B, each with a spinning record, progress, play and stop, and volume",
    caption: "Two decks on one playlist that mixes Spotify and YouTube tracks",
  },
  {
    file: "2-search.png",
    label: "Search",
    alt: "ReAMP's search for 'gorillaz' open over the decks, listing YouTube results, each with an add button",
    caption: "One search across both services; each result adds to the playlist",
  },
  {
    file: "3-crossfade-settings.png",
    label: "Crossfade",
    alt: "ReAMP's crossfade settings panel: duration, auto threshold and minimum time sliders, with auto crossfade on",
    caption: "Crossfade settings: duration, auto threshold and minimum play time",
  },
  {
    file: "4-crossfading.png",
    label: "Mixing",
    alt: "Both decks playing while ReAMP crossfades between them, the Crossfading indicator lit and the deck volumes moving",
    caption: "A crossfade in progress between the two decks",
  },
];

manifest.reamp = [];
for (const [i, s] of REAMP.entries()) {
  const src = join(shotsDir, "reamp", s.file);
  if (!existsSync(src)) {
    console.warn(`missing ${src}: skipped`);
    continue;
  }
  const id = `reamp-app-${i + 1}`;
  for (const w of [640, 1120]) {
    await write(sharp(src).resize({ width: w, height: Math.round((w * 9) / 16), fit: "cover", position: "top" }), id, w);
  }
  manifest.reamp.push({ image: `/work/${id}`, widths: [640, 1120], width: 1120, height: 630, label: s.label, alt: s.alt, caption: s.caption });
  console.log(`reamp: ${s.file} -> ${id}`);
}

writeFileSync(join(root, "src", "content", "shots.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `wrote src/content/shots.json: ${manifest.stremio.length} stremio, ${manifest.powderino.length} powderino, ${manifest.reamp.length} reamp`,
);
