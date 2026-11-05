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
// - eved/      Eved's public pages from the Internet Archive (2013-2014), listed in EVED; see its README.
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

/**
 * Eved's public pages as the Internet Archive kept them in 2013 and 2014, the years Alex worked on its
 * backend at Zega Software (the product sat behind a login: no app screens were archived). Captured
 * 2026-11-05 at 1280x800 from the archive's toolbar-free view; cut to 16:9 from the top.
 */
const EVED = [
  {
    file: "1-home-2013-05-20.png",
    label: "Home, 2013",
    alt: "Eved's home page in May 2013: 'Welcome to Eved, Your Meeting and Event Marketplace', with Learn More and Sign Up Free buttons and a webinar series for destination management companies",
    caption: "eved.com home page, 20 May 2013 (Internet Archive)",
  },
  {
    file: "2-how-it-works-2013-05-20.png",
    label: "How it works",
    alt: "Eved's How It Works page in May 2013: a diagram linking corporations, meeting and incentive companies, destination management companies, hotels, event venues and wholesale suppliers",
    caption: "How It Works: the marketplace between event buyers and suppliers, 20 May 2013 (Internet Archive)",
  },
  {
    file: "3-buyers-2014-03-06.png",
    label: "For buyers",
    alt: "Eved's page for meeting and event buyers in March 2014: a source-to-pay procurement solution in three steps, Source, Contract and Pay",
    caption: "For buyers: source, contract and pay, 6 March 2014 (Internet Archive)",
  },
  {
    file: "4-buyer-sellers-2014-03-06.png",
    label: "For planners",
    alt: "Eved's page for buyer/sellers in March 2014: e360, a back-office system for planners, in four steps, Source, Propose, Contract and Pay",
    caption: "For buyer/sellers (planners): e360, source to pay, 6 March 2014 (Internet Archive)",
  },
];

manifest.eved = [];
for (const [i, s] of EVED.entries()) {
  const src = join(shotsDir, "eved", s.file);
  if (!existsSync(src)) {
    console.warn(`missing ${src}: skipped`);
    continue;
  }
  const id = `eved-${i + 1}`;
  // the content column of each page, 16:9 from its top (2013: a 960px site; 2014: 980px)
  const crop = i < 2 ? { left: 160, top: 0, width: 960, height: 540 } : { left: 150, top: 0, width: 980, height: 551 };
  const base = sharp(src).extract(crop);
  const widths = [640, crop.width];
  for (const w of widths) await write(base.clone().resize({ width: w }), id, w);
  manifest.eved.push({
    image: `/work/${id}`,
    widths,
    width: crop.width,
    height: Math.round((crop.height / crop.width) * crop.width),
    label: s.label,
    alt: s.alt,
    caption: s.caption,
  });
  console.log(`eved: ${s.file} -> ${id}`);
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

/**
 * LocalsOnly v2 (repo localOnlyV2) as deployed on Vercel (local-only-v2.vercel.app), browsed on
 * 2026-11-05 at 1440x810. (v1's MongoDB Atlas cluster no longer exists, so v1 cannot show data.)
 */
await frames("localsonly", [
  {
    file: "1-home.png",
    label: "Home",
    alt: "LocalsOnly's home page: 'The Bear Necessities' over a bear in hiking gear, the where and what search, and badges to earn such as Foraging and Honey Hunter",
    caption: "The home page: outdoor and local experiences across Romania, and badges to earn",
  },
  {
    file: "2-experiences.png",
    label: "Experiences",
    alt: "The Experiences page: activity chips and cards for experiences such as Two days on the Făgăraș ridge, each with tags, place, host, rating and price in lei",
    caption: "Experiences from the database, each with its tags, host, rating and price",
  },
  {
    file: "3-filters.png",
    label: "Filters",
    alt: "The Filters panel: a price range slider with the average price, activity types, time of day, duration and specials, and 'Show all 10 results'",
    caption: "Filters by price, activity, time of day, duration and specials, with a live result count",
  },
  {
    file: "4-experience.png",
    label: "Experience",
    alt: "The page for Two days on the Făgăraș ridge: its rating, place, Share and Save, and a photo gallery",
    caption: "An experience's page: rating, place and its photos",
  },
  {
    file: "5-booking.png",
    label: "Booking",
    alt: "What we will do, what's included (stay, food, transport) and the booking box with a price per person, dates and guests",
    caption: "What's included, and the booking box with dates and guests",
  },
  {
    file: "6-host.png",
    label: "Host",
    alt: "The Host an experience page: describe it, set a price in lei, publish and edit any time, with Sign in with Google to start",
    caption: "Hosting: sign in with Google and publish your own listing",
  },
]);

/** This dashboard at 1440x810, captured from its production build on 2026-11-05 (dark, then light). */
await frames("cvdashboard", [
  {
    file: "1-overview.png",
    label: "Overview",
    alt: "The CV dashboard's Overview: headline figures, the career ladder, results with their sources, skills in use by year, kinds of work, skills, About and industries, on one screen",
    caption: "The Overview: everything on one laptop screen, no tabs, no scrolling",
  },
  {
    file: "2-experience-ladder.png",
    label: "Career ladder",
    alt: "Experience with React chosen: the career ladder keeps Pentalog, TryAngle Labs, the 2021 freelance work and three projects lit, and steps the other roles back",
    caption: "The career ladder: pick a skill and every role and project that used it stays lit",
  },
  {
    file: "3-skills-matrix.png",
    label: "Skills matrix",
    alt: "The Skills matrix with L.H.EL hovered: its column lit and the skills it did not use stepped back",
    caption: "Skills against roles: hover a company to see its stack",
  },
  {
    file: "4-projects.png",
    label: "Projects",
    alt: "The Projects view with Eved chosen: its details beside its archived 2013 home page",
    caption: "Projects: each with its details and real screenshots",
  },
  {
    file: "5-light.png",
    label: "Backlight on",
    alt: "The Overview in the light theme, after the Backlight switch is turned on",
    caption: "Backlight on: the light theme, switched on like an old screen",
  },
]);

writeFileSync(join(root, "src", "content", "shots.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`wrote src/content/shots.json: ${Object.entries(manifest).map(([k, v]) => `${v.length} ${k}`).join(", ")}`);
