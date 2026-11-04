// Builds the CV PDF from the Design canvas pages, so the site always serves the latest CV.
// Run it after every CV change (then commit public/CV_AlexVataselu.pdf):
//
//   pnpm cv:pdf [cvDir]
//
// cvDir defaults to E:\WorkAV\cv and holds project/CV-Page1.dc.html, project/CV-Page2.dc.html (the
// canvas's two A4 artboards, kept in step with the canvas) and source/photo.webp (the portrait the
// canvas serves as an upload). Writes public/CV_AlexVataselu.pdf here and CV_AlexVataselu.pdf in cvDir.
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cvDir = process.argv[2] ?? "E:/WorkAV/cv";
const pages = ["CV-Page1.dc.html", "CV-Page2.dc.html"].map((f) => readFileSync(join(cvDir, "project", f), "utf8"));
const photo = `data:image/webp;base64,${readFileSync(join(cvDir, "source", "photo.webp")).toString("base64")}`;

/** An artboard's page: the 794x1123 root inside <x-dc>, with its upload pointed at the local portrait. */
const body = (html) =>
  html
    .match(/<x-dc>([\s\S]*?)<\/x-dc>/)[1]
    .replace(/<helmet>[\s\S]*?<\/helmet>/, "")
    .replace(/\/_blob\/[0-9a-f]{32}/g, photo);
const helmet = pages[0].match(/<helmet>([\s\S]*?)<\/helmet>/)[1];
const unresolved = pages.map(body).join("").match(/\/_blob\/[0-9a-f]{32}/);
if (unresolved) throw new Error(`an upload has no local copy: ${unresolved[0]}`);

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Alex Vataselu CV</title>${helmet}
<style>.pdf-page{break-after:page}.pdf-page:last-child{break-after:auto}</style></head>
<body>${pages.map((p) => `<div class="pdf-page">${body(p)}</div>`).join("")}</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

// Every page must fit its A4 sheet: content past 1123px would spill onto an extra page.
const overflow = await page.evaluate(() =>
  [...document.querySelectorAll(".pdf-page > div")].map((sheet) => {
    const top = sheet.getBoundingClientRect().top;
    let bottom = 0;
    sheet.querySelectorAll("main section *").forEach((e) => (bottom = Math.max(bottom, e.getBoundingClientRect().bottom - top)));
    return Math.round(1123 - bottom);
  }),
);
overflow.forEach((space, i) => console.log(`page ${i + 1}: ${space}px to spare`));
if (overflow.some((space) => space < 0)) throw new Error("a page runs past A4: shorten it on the canvas first");

const pdf = await page.pdf({ width: "794px", height: "1123px", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();

const out = join(root, "public", "CV_AlexVataselu.pdf");
writeFileSync(out, pdf);
console.log(`wrote ${out} (${Math.round(pdf.length / 1024)} KB)`);
try {
  copyFileSync(out, join(cvDir, "CV_AlexVataselu.pdf"));
  console.log(`copied to ${join(cvDir, "CV_AlexVataselu.pdf")}`);
} catch (e) {
  console.warn(`could not update ${join(cvDir, "CV_AlexVataselu.pdf")} (open in a PDF reader?): ${e.code}`);
}
