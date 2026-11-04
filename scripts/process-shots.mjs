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
// - builderai/ Builder.ai's public pages from the Internet Archive, listed in BUILDERAI.
// - innobyte/  ElbilAppen phone screens from the Innobyte project, listed in INNOBYTE.
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

/**
 * Builder.ai's own public pages as the Internet Archive kept them (builder.ai is offline since the
 * company's 2025 insolvency); the internal tools Alex worked on were never public. Each crop is
 * written no wider than its source, so nothing is upscaled.
 */
const BUILDERAI = [
  {
    file: "archive-home.png",
    crop: { left: 0, top: 0, width: 1424, height: 801 },
    label: "Home",
    alt: "Builder.ai's home page in February 2025: 'We make building an app so easy, anyone can do it', with app screens beside the headline",
    caption: "Builder.ai's public home page, February 2025 (Internet Archive)",
  },
  {
    file: "step1.png",
    label: "Explain the idea",
    alt: "Builder Studio's first step: a chat with Natasha, Builder.ai's AI, asking what you are building, with Talk, Chat and Upload options",
    caption: "Builder Studio, step 1: describe the app to Natasha by talk, chat or a document",
  },
  {
    file: "step2.png",
    label: "Features",
    alt: "Builder Studio's second step: base apps to start from, a list of user journeys, and the phone screens for the chosen journey",
    caption: "Builder Studio, step 2: features grouped into user journeys, with the screens for each",
  },
];

manifest.builderai = [];
for (const [i, s] of BUILDERAI.entries()) {
  const src = join(shotsDir, "builderai", s.file);
  if (!existsSync(src)) {
    console.warn(`missing ${src}: skipped`);
    continue;
  }
  const id = `builderai-${i + 1}`;
  const base = s.crop ? sharp(src).extract(s.crop) : sharp(src);
  const meta = s.crop ?? (await sharp(src).metadata());
  const widths = [640, Math.min(1120, meta.width)];
  for (const w of widths) await write(base.clone().resize({ width: w }), id, w);
  manifest.builderai.push({
    image: `/work/${id}`,
    widths,
    width: widths[1],
    height: Math.round((meta.height / meta.width) * widths[1]),
    label: s.label,
    alt: s.alt,
    caption: s.caption,
  });
  console.log(`builderai: ${s.file} -> ${id}`);
}

/** ElbilAppen phone screens from the Innobyte project (TryAngle Labs, 2021); 500px wide at source. */
const INNOBYTE = [
  {
    file: "elbil-screen-1.png",
    label: "Trip planner",
    alt: "ElbilAppen's Plan Trip screen: London Bridge to Rome, a Tesla Model S as the vehicle, and start and end range sliders",
    caption: "Plan Trip: start, destination, the car, and the range to start and end with",
  },
  {
    file: "elbil-screen-2.png",
    label: "Stations map",
    alt: "ElbilAppen's stations map over England, charging stations clustered into numbered markers",
    caption: "The stations map, with charging stations clustered as you zoom out",
  },
  {
    file: "elbil-screen-3.png",
    label: "Route",
    alt: "A planned route from London to Rome across Europe: six charging stops with their charging times, 22 hr 25 min and 1866 km in total",
    caption: "A planned route: each charging stop with its charging time, then the total",
  },
  {
    file: "elbil-screen-4.png",
    label: "Vehicle",
    alt: "Vehicle details for a Tesla Model S Performance: real, EPA and WLTP range, usable battery and efficiency",
    caption: "Vehicle details: the range figures and battery the planner works from",
  },
];

manifest.innobyte = [];
for (const [i, s] of INNOBYTE.entries()) {
  const src = join(shotsDir, "innobyte", s.file);
  if (!existsSync(src)) {
    console.warn(`missing ${src}: skipped`);
    continue;
  }
  const id = `innobyte-${i + 1}`;
  const meta = await sharp(src).metadata();
  const widths = [320, meta.width];
  for (const w of widths) await write(sharp(src).resize({ width: w }), id, w);
  manifest.innobyte.push({
    image: `/work/${id}`,
    widths,
    width: meta.width,
    height: meta.height,
    label: s.label,
    alt: s.alt,
    caption: s.caption,
  });
  console.log(`innobyte: ${s.file} -> ${id}`);
}

/**
 * 16:9 frames, written no wider than their source: a tall page is cut from the top ("top"); a small
 * piece such as a modal is centred on a backdrop of its own colour ("contain").
 */
async function frames(key, list) {
  manifest[key] = [];
  for (const [i, s] of list.entries()) {
    const src = join(shotsDir, key, s.file);
    if (!existsSync(src)) {
      console.warn(`missing ${src}: skipped`);
      continue;
    }
    const id = `${key}-${i + 1}`;
    const meta = await sharp(src).metadata();
    const top = Math.min(1120, meta.width);
    const widths = top > 640 ? [640, top] : [top];
    for (const w of widths) {
      const h = Math.round((w * 9) / 16);
      const img =
        s.fit === "contain"
          ? sharp(src).resize({ width: w, height: h, fit: "contain", background: s.background })
          : sharp(src).resize({ width: w, height: h, fit: "cover", position: "top" });
      await write(img, id, w);
    }
    const width = widths.at(-1);
    manifest[key].push({
      image: `/work/${id}`,
      widths,
      width,
      height: Math.round((width * 9) / 16),
      label: s.label,
      alt: s.alt,
      caption: s.caption,
    });
    console.log(`${key}: ${s.file} -> ${id}`);
  }
}

/** Alex's own Figma page designs for LocalsOnly (2023); the live app needs its retired API. */
await frames("localsonly", [
  {
    file: "1-home.png",
    label: "Home",
    alt: "LocalsOnly home page design: 'Way of the fox' hero over a mountain photo, with challenge badges below",
    caption: "Figma design: the home page, with challenges and their badges",
  },
  {
    file: "2-listing.png",
    label: "Listing",
    alt: "LocalsOnly listing design: filter chips, recommended experiences and a grid of all experiences with prices",
    caption: "Figma design: experiences near you, recommended ones first",
  },
  {
    file: "3-details.png",
    label: "Details",
    alt: "LocalsOnly experience page design: a photo gallery, the experience's facts, the booking panel and a route map",
    caption: "Figma design: an experience's page, with photos, booking and the route on a map",
  },
  {
    file: "4-filters.png",
    label: "Filters",
    fit: "contain",
    background: "#232323",
    alt: "LocalsOnly filters design: activity type, a price range slider, time of day, duration and specials",
    caption: "Figma design: filters by activity, price, time of day and duration",
  },
  {
    file: "5-home-dark.png",
    label: "Home, dark",
    alt: "A dark LocalsOnly home page design: 'The bear necessities' hero with badges, trust points and new experiences",
    caption: "Figma design: an alternative dark home page",
  },
]);

/** This dashboard, captured from alexvataselu.vercel.app on 2026-11-04. */
await frames("cvdashboard", [
  {
    file: "overview.png",
    label: "Overview",
    alt: "The CV dashboard's Overview: profile rail, headline figures, the career timeline and results with their sources",
    caption: "The Overview on a laptop: one screen, no scrolling",
  },
  {
    file: "skills.png",
    label: "Skills",
    alt: "The CV dashboard's Skills view with TypeScript chosen: its bar on the career axis and the roles and projects that used it",
    caption: "Skills: pick one and every role and project that used it lights up",
  },
]);

writeFileSync(join(root, "src", "content", "shots.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`wrote src/content/shots.json: ${Object.entries(manifest).map(([k, v]) => `${v.length} ${k}`).join(", ")}`);
