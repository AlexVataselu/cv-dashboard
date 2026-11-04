import { expect, test } from "@playwright/test";

const ROUTES = [
  { path: "/", label: "Overview", h1: "Overview" },
  { path: "/experience", label: "Experience", h1: "Experience" },
  { path: "/skills", label: "Skills", h1: "Skills" },
  { path: "/projects", label: "Projects", h1: "Projects" },
  { path: "/education", label: "Education", h1: "Education" },
];

test("first screen at 1280x800 shows name, title and Email without scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const rail = page.locator("aside");
  await expect(rail.getByText("Alex Vataselu", { exact: true })).toBeInViewport();
  await expect(rail.getByText("Senior Frontend Engineer")).toBeInViewport();
  await expect(rail.getByRole("link", { name: "Email me" })).toBeInViewport();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("nav links load their section and Back returns to the previous one", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Sections" });
  await nav.getByRole("link", { name: "Skills" }).click();
  await expect(page).toHaveURL(/\/skills$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Skills");
  await nav.getByRole("link", { name: "Projects" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Skills");
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Overview");
});

test("the status bar persists across tab switches: one bar, not remounted, vitals kept", async ({ page }) => {
  await page.goto("/");
  const bar = page.locator('footer[aria-label="Site performance"]');
  await expect(bar).toHaveCount(1);
  // LCP settles after the first paint; wait until the bar shows it.
  await expect(bar.getByRole("group", { name: "LCP" })).not.toHaveText(/–/);
  await bar.evaluate((el) => ((el as HTMLElement & { __kept?: boolean }).__kept = true));
  const nav = page.getByRole("navigation", { name: "Sections" });
  await nav.getByRole("link", { name: "Skills" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Skills");
  await expect(bar).toHaveCount(1);
  // The same element: the layout kept it mounted, so its observers were registered once.
  expect(await bar.evaluate((el) => (el as HTMLElement & { __kept?: boolean }).__kept === true)).toBe(true);
  await expect(bar.getByRole("group", { name: "LCP" })).not.toHaveText(/–/);
  await expect(nav.getByRole("link", { name: "Skills" })).toHaveAttribute("aria-current", "page");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("all 5 sections render through the nav links", async ({ page }) => {
    await page.goto("/");
    for (const r of ROUTES) {
      await page
        .getByRole("navigation", { name: "Sections" })
        .getByRole("link", { name: r.label })
        .click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(r.h1);
      await expect(page.locator("main")).not.toBeEmpty();
    }
  });

  test("every role opens via its summary and shows its bullets; newest renders open", async ({
    page,
  }) => {
    await page.goto("/experience");
    const roles = page.locator("details");
    const count = await roles.count();
    expect(count).toBeGreaterThan(1);
    await expect(roles.first()).toHaveJSProperty("open", true);
    await expect(roles.nth(1)).toHaveJSProperty("open", false);
    for (let i = 0; i < count; i++) {
      const role = roles.nth(i);
      if (i > 0) await role.locator("summary").click();
      await expect(role).toHaveJSProperty("open", true);
      const bullets = role.locator("li");
      expect(await bullets.count()).toBeGreaterThan(0);
      await expect(bullets.first()).toBeVisible();
    }
  });
});

test("320x640 has no horizontal overflow on any route", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const r of ROUTES) {
    await page.goto(r.path);
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(w, `${r.path} scrollWidth`).toBeLessThanOrEqual(320);
  }
});

test("320px: the 'Uses X' badge has its own line and never covers a role's dates, with no shift", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/experience");
  const summaries = page.locator("details > summary");
  const plain = await Promise.all((await summaries.all()).map((s) => s.boundingBox()));

  await page.goto("/experience?skill=nextjs");
  const badges = page.locator("summary").getByText(/^Uses Next\.js/);
  await expect(badges.first()).toBeVisible();
  expect(await badges.count()).toBeGreaterThanOrEqual(1);

  const count = await summaries.count();
  for (let i = 0; i < count; i++) {
    const summary = summaries.nth(i);
    const period = summary.locator("[data-period]");
    const p = (await period.boundingBox())!;
    // The dates are fully visible: inside the screen and not cut off by their box.
    expect(p.x, `role ${i} period left`).toBeGreaterThanOrEqual(0);
    expect(p.x + p.width, `role ${i} period right`).toBeLessThanOrEqual(320);
    expect(await period.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    const badge = summary.getByText(/^Uses /);
    if ((await badge.count()) > 0) {
      const b = (await badge.boundingBox())!;
      const overlaps = b.x < p.x + p.width && p.x < b.x + b.width && b.y < p.y + p.height && p.y < b.y + b.height;
      expect(overlaps, `role ${i}: badge covers the dates`).toBe(false);
      expect(b.y, `role ${i}: badge sits below the dates`).toBeGreaterThanOrEqual(p.y + p.height);
    }
    // The badge line is reserved, so selecting a skill moves nothing.
    expect(await summary.boundingBox(), `role ${i} summary box`).toEqual(plain[i]);
  }
});

test("/projects?skill=expo highlights Powderino in the project list with a text badge and no layout shift", async ({
  page,
}) => {
  await page.goto("/projects");
  const card = page.locator("label.pick", { hasText: "Powderino" });
  const plain = await card.boundingBox();
  await page.goto("/projects?skill=expo");
  await expect(card).toHaveAttribute("data-highlight", "true");
  // WCAG 1.4.1: the highlight is not colour alone.
  await expect(card.getByText("Uses Expo")).toBeVisible();
  const before = await card.boundingBox();
  await page.waitForTimeout(300);
  const after = await card.boundingBox();
  expect(after).toEqual(before);
  expect(before).toEqual(plain);
});

test("/skills shows where each skill was used, linking with ?skill kept", async ({ page }) => {
  await page.goto("/skills");
  await page.getByRole("button", { name: /^Expo\b/ }).hover();
  const card = page.locator('[data-detail="expo"]');
  await expect(card).toBeVisible();
  await expect(card).toContainText("Used in 1 role and 1 project.");
  await card.getByRole("link", { name: /Powderino/ }).click();
  await expect(page).toHaveURL(/\/projects\?skill=expo#project-powderino$/);
  await expect(page.locator("#project-powderino")).toHaveAttribute("data-highlight", "true");
});

test("?skill stays in step with the highlight across navigation and Back/Forward", async ({
  page,
}) => {
  const nav = page.getByRole("navigation", { name: "Sections" });
  const expoChip = page.getByRole("button", { name: /^Expo\b/ });
  const reactChip = page.getByRole("button", { name: /^React ·/ });
  const powderino = page.locator("article", { hasText: "Powderino" });
  const reamp = page.locator("article", { hasText: "ReAMP" });

  await page.goto("/projects");
  await nav.getByRole("link", { name: "Skills" }).click();
  await expect(page).toHaveURL(/\/skills$/);
  await expoChip.click();
  await expect(page).toHaveURL(/\/skills\?skill=expo$/);

  await nav.getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects\?skill=expo$/);
  await expect(powderino).toHaveAttribute("data-highlight", "true");
  await expect(reamp).not.toHaveAttribute("data-highlight", "true");

  // Back to /skills?skill=expo: the chip is still pressed.
  await page.goBack();
  await expect(page).toHaveURL(/\/skills\?skill=expo$/);
  await expect(expoChip).toHaveAttribute("aria-pressed", "true");
  await reactChip.click();
  await expect(page).toHaveURL(/\/skills\?skill=react$/);

  // Back to the first /projects entry, which had no ?skill: nothing is highlighted.
  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator('[data-highlight="true"]')).toHaveCount(0);

  // Forward again: the URL says react, so the highlight follows the URL.
  await page.goForward();
  await expect(page).toHaveURL(/\/skills\?skill=react$/);
  await expect(reactChip).toHaveAttribute("aria-pressed", "true");
});

test("page source has no +40 and no telephone", async ({ request }) => {
  for (const r of ROUTES) {
    const html = await (await request.get(r.path)).text();
    expect(html, r.path).not.toContain("+40");
    expect(html, r.path).not.toContain("telephone");
  }
});

// Mobile performance guard. Lighthouse's simulated LCP counts every
// request that finishes before the first paint, so the critical path must stay lean.
test("critical path: only latin fonts preloaded, yield script present, content not hidden", async ({
  request,
}) => {
  const attrs = (tag: string) =>
    Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
  for (const r of ROUTES) {
    const html = await (await request.get(r.path)).text();
    const links = [...html.matchAll(/<link\b[^>]*>/g)].map((m) => attrs(m[0]));
    const fontPreloads = links.filter((l) => l.rel === "preload" && l.as === "font");
    expect(fontPreloads.length, `${r.path} font preloads`).toBe(2);
    // Each preloaded file must be a latin subset: its @font-face covers U+0000-00FF
    // (the minifier writes that as the wildcard U+??).
    const css = (
      await Promise.all(
        links
          .filter((l) => l.rel === "stylesheet")
          .map(async (l) => (await request.get(l.href)).text()),
      )
    ).join("");
    for (const font of fontPreloads) {
      const file = font.href.split("/").pop()!;
      const face = css.match(new RegExp(`@font-face\\{[^}]*${file.replace(/[.]/g, "\\.")}[^}]*\\}`));
      expect(face?.[0], `${r.path} ${file} @font-face`).toBeTruthy();
      expect(face![0], `${r.path} ${file} is latin`).toMatch(/unicode-range:\s*U\+(?:0{0,4}-0{0,2}FF|\?\?)[,;}]/i);
    }
    // Presence only. Whether Next.js still yields a task after it is not testable
    // here; Lighthouse mobile TBT in CI is the real guard.
    expect(html, `${r.path} yield script present`).toContain('"id":"yield-before-hydration"');
    // The main content is plain server HTML: no Suspense template, no hidden attribute.
    const start = html.indexOf('<main id="main"');
    expect(start, `${r.path} main`).toBeGreaterThan(-1);
    const main = html.slice(start, html.indexOf("</main>", start));
    expect(main, r.path).not.toContain("<template");
    expect(main, r.path).not.toMatch(/<[a-z][a-z0-9]*(?:\s+[\w:-]+(?:="[^"]*")?)*\s+hidden(?:=""|\s|\/?>)/);
    // Images in <main> are lazy, except the one above the fold on /projects (the first project's
    // screenshot). None is preloaded or high priority, so none competes with the fonts and the photo.
    const eager = [...main.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]).filter((t) => !t.includes('loading="lazy"'));
    expect(eager.length, `${r.path} non-lazy images in main`).toBe(r.path === "/projects" ? 1 : 0);
    expect(main, `${r.path} no high-priority image in main`).not.toMatch(/fetchpriority="high"/i);
    expect(links.filter((l) => l.rel === "preload" && l.as === "image"), `${r.path} image preloads`).toEqual([]);
  }
});

test("metadata: title, description, canonical, OG, Twitter and JSON-LD", async ({ page }) => {
  await page.goto("/projects");
  await expect(page).toHaveTitle("Projects · Alex Vataselu");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{40,}/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/projects$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /opengraph-image/,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await page.goto("/");
  await expect(page).toHaveTitle("Alex Vataselu · Senior Frontend Engineer");
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  expect(ld["@type"]).toBe("Person");
  expect(ld.name).toBe("Alex Vataselu");
  expect(ld.jobTitle).toBe("Senior Frontend Engineer");
  expect(ld.email).toBe("mailto:vataselu.alex@gmail.com");
  expect(ld.sameAs).toEqual([
    "https://linkedin.com/in/alex-vataselu",
    "https://github.com/AlexVataselu",
  ]);
  expect(ld.image).toMatch(/\/photo\.webp$/);
});

test("robots.txt and sitemap.xml are served", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap:");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  for (const p of ["/experience", "/skills", "/projects", "/education"]) expect(xml).toContain(p);
});

test("no console errors, page errors or HTTP >= 400 across all routes and nav clicks", async ({
  page,
}) => {
  const problems: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`);
  });
  for (const r of ROUTES) {
    await page.goto(r.path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(r.h1);
  }
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Sections" });
  for (const r of ROUTES.slice(1)) {
    await nav.getByRole("link", { name: r.label }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(r.h1);
  }
  await nav.getByRole("link", { name: "Overview" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Overview");
  await page.waitForLoadState("networkidle");
  expect(problems).toEqual([]);
});

test("Overview thumbnails load the 240px files, not the 640px ones", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const work: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/work/")) work.push(new URL(r.url()).pathname);
  });
  await page.goto("/");
  const thumbs = page.locator('main img[alt^="Front page of"]');
  await expect(thumbs).toHaveCount(6);
  for (const img of await thumbs.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.currentSrc)).toMatch(/-240\.(avif|webp)$/);
  }
  expect(work.filter((p) => /-(640|1120)\./.test(p))).toEqual([]);
});

test("prefers-reduced-motion: the chevron and the button press do not animate", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/experience");
  const chev = page.locator("summary .chev").first();
  expect(await chev.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");
  const btn = page.locator(".btn").first();
  expect(await btn.evaluate((el) => getComputedStyle(el).transitionProperty)).not.toContain("transform");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(await chev.evaluate((el) => getComputedStyle(el).transitionDuration)).not.toBe("0s");
});

test("skills matrix: each cell sits under its role's column head; hovering a role steps back the skills it did not use", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/skills");
  const centre = (sel: string) =>
    page.locator(sel).first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2;
    });
  for (const col of ["kemblimed", "lhel", "pentalog", "projects"]) {
    const head = await centre(`.mx-col[data-col="${col}"]`);
    const cell = await centre(`.sm-row[data-skill="typescript"] .mx-cell[data-col="${col}"]`);
    expect(Math.abs(head - cell)).toBeLessThanOrEqual(1);
  }
  await page.locator('.mx-col[data-col="lhel"]').hover();
  const opacity = (id: string) =>
    page.locator(`.sm-row[data-skill="${id}"]`).evaluate((el) => Number(getComputedStyle(el).opacity));
  await expect.poll(() => opacity("magento")).toBe(1);
  await expect.poll(() => opacity("react")).toBeLessThan(0.5);
});

for (const width of [320, 412, 768, 1280]) {
  test(`career timeline at ${width}px: no bar shows clipped words`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const clipped = await page.$$eval(".tl-bar", (bars) =>
      bars
        .map((b) => {
          const t = b.querySelector<HTMLElement>(".tl-bar-text")!;
          if (getComputedStyle(t).display === "none") return null;
          const cs = getComputedStyle(b);
          const inside = b.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
          const r = document.createRange();
          r.selectNodeContents(t);
          return r.getBoundingClientRect().width > inside + 0.5 ? t.textContent : null;
        })
        .filter((x) => x !== null),
    );
    expect(clipped).toEqual([]);
  });
}
